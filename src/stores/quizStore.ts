import { defineStore } from 'pinia'
import { decodeHtmlEntities, shuffleArray, type QuizDifficulty } from '../helpers/quizUtils'
import { useUserStore } from './userStore'
import {
  fetchRemoteLeaderboards,
  hasRemoteLeaderboard,
  submitRemoteLeaderboardEntry,
} from '../helpers/leaderboardService'

export interface TriviaApiQuestion {
  question: string
  correct_answer: string
  incorrect_answers: string[]
  category: string
  difficulty: QuizDifficulty
}

export interface QuizQuestion {
  id: string
  prompt: string
  answers: string[]
  correctAnswer: string
  category: string
  difficulty: QuizDifficulty
}

export interface LeaderboardEntry {
  name: string
  score: number
  achievedAt: string
}

export interface AnswerRecord {
  selected: string
  correct: boolean
  scoreDelta: number
}

export type LeaderboardMap = Record<QuizDifficulty, LeaderboardEntry[]>

type QuizStatus = 'idle' | 'loading' | 'active' | 'finished' | 'error'

export const QUESTIONS_PER_ROUND = 10
export const FIFTY_FIFTY_LIMIT = 2
export const DOUBLE_SCORE_LIMIT = 1

const LEADERBOARD_STORAGE_KEY = 'quizApp.leaderboards'
const PREFERENCES_STORAGE_KEY = 'quizApp.preferences'

function emptyLeaderboards(): LeaderboardMap {
  return {
    easy: [],
    medium: [],
    hard: [],
  }
}

function loadLeaderboardsFromStorage(): LeaderboardMap {
  if (typeof window === 'undefined') {
    return emptyLeaderboards()
  }

  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY)
    if (!raw) return emptyLeaderboards()
    const data = JSON.parse(raw) as Partial<LeaderboardMap>
    return {
      easy: Array.isArray(data?.easy) ? data!.easy : [],
      medium: Array.isArray(data?.medium) ? data!.medium : [],
      hard: Array.isArray(data?.hard) ? data!.hard : [],
    }
  } catch {
    return emptyLeaderboards()
  }
}

function persistLeaderboards(data: LeaderboardMap) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

function loadPreferences() {
  if (typeof window === 'undefined') {
    return { category: 'any', difficulty: 'easy' as QuizDifficulty }
  }

  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY)
    if (!raw) return { category: 'any', difficulty: 'easy' as QuizDifficulty }
    const parsed = JSON.parse(raw) as Partial<{
      category: string
      difficulty: QuizDifficulty
    }>
    return {
      category: typeof parsed?.category === 'string' ? parsed.category : 'any',
      difficulty:
        parsed?.difficulty === 'easy' || parsed?.difficulty === 'medium' || parsed?.difficulty === 'hard'
          ? parsed.difficulty
          : ('easy' as QuizDifficulty),
    }
  } catch {
    return { category: 'any', difficulty: 'easy' as QuizDifficulty }
  }
}

function persistPreferences(category: string, difficulty: QuizDifficulty) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ category, difficulty }),
    )
  } catch {
    // ignore
  }
}
function mapQuestion(question: TriviaApiQuestion): QuizQuestion {
  const prompt = decodeHtmlEntities(question.question)
  const answers = shuffleArray([
    question.correct_answer,
    ...question.incorrect_answers,
  ]).map((answer) => decodeHtmlEntities(answer))

  return {
    id: `${question.question}-${question.correct_answer}`,
    prompt,
    answers,
    correctAnswer: decodeHtmlEntities(question.correct_answer),
    category: question.category,
    difficulty: question.difficulty,
  }
}

const initialPreferences = loadPreferences()

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    questions: [] as QuizQuestion[],
    answers: {} as Record<number, AnswerRecord>,
    currentIndex: 0,
    status: 'idle' as QuizStatus,
    errorMessage: '' as string | null,
    selectedCategory: initialPreferences.category,
    selectedDifficulty: initialPreferences.difficulty,
    autoAdvanceId: null as number | null,
    fiftyFiftyUses: 0,
    fiftyFiftyMap: {} as Record<number, string[]>,
    doubleScoreUsed: false,
    doubleScoreArmed: false,
    leaderboards: loadLeaderboardsFromStorage(),
  }),
  getters: {
    currentQuestion(state) {
      return state.questions[state.currentIndex] ?? null
    },
    totalQuestions(state) {
      return state.questions.length
    },
    currentAnswer(state) {
      return state.answers[state.currentIndex] ?? null
    },
    currentHiddenAnswers(state) {
      return state.fiftyFiftyMap[state.currentIndex] ?? []
    },
    fiftyFiftyRemaining(state) {
      return Math.max(0, FIFTY_FIFTY_LIMIT - state.fiftyFiftyUses)
    },
    canUseDoubleScore(state) {
      return !state.doubleScoreUsed && !state.doubleScoreArmed
    },
  },
  actions: {
    async syncRemoteLeaderboards() {
      if (!hasRemoteLeaderboard) return
      try {
        const remote = await fetchRemoteLeaderboards()
        if (remote) {
          this.leaderboards = remote
          persistLeaderboards(this.leaderboards)
        }
      } catch (error) {
        console.warn('Failed to sync remote leaderboards', error)
      }
    },
    applyLocalLeaderboardEntry(entry: LeaderboardEntry, difficulty: QuizDifficulty) {
      const bucket = this.leaderboards[difficulty]
      this.leaderboards[difficulty] = [entry, ...bucket]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
      persistLeaderboards(this.leaderboards)
    },
    async pushEntryToRemote(entry: LeaderboardEntry, difficulty: QuizDifficulty) {
      if (!hasRemoteLeaderboard) return
      try {
        const success = await submitRemoteLeaderboardEntry(entry, difficulty)
        if (success) {
          await this.syncRemoteLeaderboards()
        }
      } catch (error) {
        console.warn('Failed to persist remote leaderboard entry', error)
      }
    },
    setCategory(categoryId: string) {
      this.selectedCategory = categoryId
      persistPreferences(this.selectedCategory, this.selectedDifficulty)
    },
    setDifficulty(difficulty: QuizDifficulty) {
      this.selectedDifficulty = difficulty
      persistPreferences(this.selectedCategory, this.selectedDifficulty)
    },
    async loadQuestions() {
      this.status = 'loading'
      this.errorMessage = ''
      this.currentIndex = 0
      this.answers = {}
      this.questions = []
      this.clearAutoAdvance()
      this.fiftyFiftyUses = 0
      this.fiftyFiftyMap = {}
      this.doubleScoreUsed = false
      this.doubleScoreArmed = false

      const params = new URLSearchParams({
        amount: QUESTIONS_PER_ROUND.toString(),
        type: 'multiple',
      })

      if (this.selectedCategory !== 'any') {
        params.append('category', this.selectedCategory)
      }

      params.append('difficulty', this.selectedDifficulty)

      try {
        const response = await fetch(`https://opentdb.com/api.php?${params.toString()}`)
        const payload = await response.json()

        if (!Array.isArray(payload.results) || payload.results.length === 0) {
          throw new Error('No questions found for these filters.')
        }

        this.questions = payload.results.map(mapQuestion)
        this.status = 'active'
      } catch (error) {
        this.status = 'error'
        this.errorMessage =
          error instanceof Error ? error.message : 'Unable to load questions. Please try again.'
      }
    },
    submitAnswer(answer: string) {
      if (this.status !== 'active') return
      if (this.currentAnswer) return
      const currentQuestion = this.currentQuestion
      if (!currentQuestion) return

      const userStore = useUserStore()
      const isCorrect = answer === currentQuestion.correctAnswer
      let scoreDelta = isCorrect ? 3 : -1
      if (this.doubleScoreArmed) {
        scoreDelta *= 2
        this.doubleScoreArmed = false
        this.doubleScoreUsed = true
      }

      this.answers[this.currentIndex] = {
        selected: answer,
        correct: isCorrect,
        scoreDelta,
      }

      userStore.addScore(scoreDelta)
      this.scheduleAutoAdvance()
    },
    goToNextQuestion() {
      this.clearAutoAdvance()
      if (!this.currentAnswer) return
      const reachedEnd = this.currentIndex >= this.questions.length - 1
      if (reachedEnd) {
        this.finishRound()
      } else {
        this.currentIndex += 1
      }
    },
    finishRound() {
      if (this.status === 'finished') return
      this.status = 'finished'
      this.clearAutoAdvance()

      const userStore = useUserStore()
      if (!userStore.name) return

      const entry: LeaderboardEntry = {
        name: userStore.name,
        score: userStore.score,
        achievedAt: new Date().toISOString(),
      }

      this.applyLocalLeaderboardEntry(entry, this.selectedDifficulty)
      void this.pushEntryToRemote(entry, this.selectedDifficulty)
    },
    resetQuizProgress() {
      this.clearAutoAdvance()
      this.questions = []
      this.answers = {}
      this.currentIndex = 0
      this.status = 'idle'
      this.errorMessage = ''
      this.fiftyFiftyUses = 0
      this.fiftyFiftyMap = {}
      this.doubleScoreUsed = false
      this.doubleScoreArmed = false
    },
    useFiftyFifty() {
      if (this.status !== 'active') return
      if (this.fiftyFiftyUses >= FIFTY_FIFTY_LIMIT) return
      if (this.fiftyFiftyMap[this.currentIndex]) return
      const currentQuestion = this.currentQuestion
      if (!currentQuestion) return

      const incorrectAnswers = currentQuestion.answers.filter(
        (answer) => answer !== currentQuestion.correctAnswer,
      )
      if (incorrectAnswers.length <= 1) return

      const toDisable = shuffleArray(incorrectAnswers).slice(0, 2)
      this.fiftyFiftyMap[this.currentIndex] = toDisable
      this.fiftyFiftyUses += 1
    },
    armDoubleScore() {
      if (this.status !== 'active') return
      if (this.doubleScoreUsed || this.doubleScoreArmed) return
      this.doubleScoreArmed = true
    },
    clearAutoAdvance() {
      if (this.autoAdvanceId !== null) {
        clearTimeout(this.autoAdvanceId)
        this.autoAdvanceId = null
      }
    },
    scheduleAutoAdvance() {
      this.clearAutoAdvance()
      this.autoAdvanceId = window.setTimeout(() => {
        this.autoAdvanceId = null
        this.goToNextQuestion()
      }, 1500)
    },
  },
})
