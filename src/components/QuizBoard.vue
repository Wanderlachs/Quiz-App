<script setup lang="ts">
import { onMounted } from 'vue'
import { useQuizStore } from '../stores/quizStore'
import { useUserStore } from '../stores/userStore'
import LeaderboardList from './LeaderboardList.vue'
import QuestionCard from './QuestionCard.vue'
import QuizSettings from './QuizSettings.vue'
import RoundSummaryPanel from './RoundSummaryPanel.vue'

const quizStore = useQuizStore()
const userStore = useUserStore()

onMounted(() => {
  quizStore.syncRemoteLeaderboards()
})

function startQuizRound() {
  userStore.resetScore()
  quizStore.resetQuizProgress()
  quizStore.loadQuestions()
}

function handleAnswer(answer: string) {
  quizStore.submitAnswer(answer)
}

function exitRound() {
  userStore.resetScore()
  quizStore.resetQuizProgress()
}

function useFiftyFifty() {
  quizStore.useFiftyFifty()
}

function useDoubleScore() {
  quizStore.armDoubleScore()
}

function changeName() {
  userStore.clearName()
  userStore.resetScore()
  quizStore.resetQuizProgress()
}
</script>

<template>
  <section class="quiz-board">
    <header
      v-if="quizStore.status !== 'active'"
      class="quiz-board__header"
    >
      <h2>Welcome back, {{ userStore.name }}!</h2>
      <button
        type="button"
        class="change-name"
        @click="changeName"
      >
        Change name
      </button>
    </header>

    <QuizSettings
      v-if="quizStore.status !== 'active'"
      :category="quizStore.selectedCategory"
      :difficulty="quizStore.selectedDifficulty"
      :loading="quizStore.status === 'loading'"
      @update:category="quizStore.setCategory"
      @update:difficulty="quizStore.setDifficulty"
      @start="startQuizRound"
    />

    <RoundSummaryPanel
      v-if="quizStore.status === 'finished'"
      :score="userStore.score"
      @restart="startQuizRound"
    />

    <div
      v-else
      class="quiz-board__content"
    >
      <p v-if="quizStore.status === 'loading'">
        Fetching fresh questions...
      </p>

      <div
        v-else-if="quizStore.status === 'error'"
        class="quiz-board__error"
      >
        <p>{{ quizStore.errorMessage }}</p>
        <button @click="startQuizRound">
          Try again
        </button>
      </div>

      <div v-else-if="quizStore.currentQuestion && quizStore.status === 'active'">
        <div class="quiz-board__score-row">
          <div class="score-pill score-pill--full">
            <span>Score</span>
            <strong>{{ userStore.score }}</strong>
          </div>
        </div>

        <QuestionCard
          :question="quizStore.currentQuestion"
          :index="quizStore.currentIndex"
          :total="quizStore.totalQuestions"
          :selected-answer="quizStore.currentAnswer?.selected ?? null"
          :is-correct="quizStore.currentAnswer?.correct ?? null"
          :score-delta="quizStore.currentAnswer?.scoreDelta ?? null"
          :disabled-answers="quizStore.currentHiddenAnswers ?? []"
          @answer="handleAnswer"
        />

        <div class="quiz-board__round-actions">
          <div class="quiz-board__joker-row">
            <button
              type="button"
              class="double-joker"
              :data-armed="quizStore.doubleScoreArmed"
              :disabled="!quizStore.canUseDoubleScore"
              @click="useDoubleScore"
            >
              x2 Score
            </button>

            <button
              type="button"
              class="joker-button"
              :disabled="
                quizStore.fiftyFiftyRemaining <= 0 || (quizStore.currentHiddenAnswers?.length ?? 0) > 0
              "
              @click="useFiftyFifty"
            >
              50 / 50 ({{ quizStore.fiftyFiftyRemaining }})
            </button>
          </div>

          <button
            type="button"
            class="exit-round"
            @click="exitRound"
          >
            Exit round
          </button>
        </div>
      </div>
    </div>

    <LeaderboardList
      :boards="quizStore.leaderboards"
      :active-difficulty="quizStore.selectedDifficulty"
      :show-only-active="quizStore.status === 'active'"
    />
  </section>
</template>

<style scoped>
.quiz-board {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: min(900px, 100%);
  margin: 0 auto;
  padding: 0 0.5rem 2rem;
}

.quiz-board__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(680px, 100%);
  margin: 0 auto;
  gap: 0.5rem;
  text-align: center;
}

.change-name {
  padding: 0.5rem 1rem;
  border-radius: 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.quiz-board__content {
  width: 100%;
  padding: 0;
}

.quiz-board__content > * {
  width: min(680px, 100%);
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
}

.quiz-board__score-row {
  width: min(680px, 100%);
  margin: 0 auto 0.75rem;
  display: flex;
  justify-content: center;
}

.quiz-board__score-row .score-pill {
  width: 100%;
  justify-content: space-between;
}

.quiz-board__round-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem auto 0;
  width: min(680px, 100%);
}

.score-pill {
  min-width: 180px;
  padding: 0.65rem 1.15rem;
  border-radius: 0.85rem;
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.45), rgba(66, 184, 131, 0.15));
  border: 1px solid rgba(66, 184, 131, 0.6);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: #f2fff7;
}

.score-pill span {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.8);
}

.score-pill strong {
  font-size: 1.4rem;
  line-height: 1;
}

.exit-round {
  padding: 0.65rem 1.5rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(255, 82, 82, 0.6);
  background: linear-gradient(135deg, rgba(255, 82, 82, 0.4), rgba(255, 82, 82, 0.15));
  color: #fff4f4;
  font-weight: 600;
  width: 100%;
}

.exit-round:hover {
  filter: brightness(1.1);
}

.joker-button {
  flex: 1;
  padding: 0.65rem 1.25rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(255, 214, 102, 0.6);
  background: linear-gradient(135deg, rgba(255, 214, 102, 0.35), rgba(255, 214, 102, 0.15));
  color: #fff8e1;
  font-weight: 600;
}

.joker-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quiz-board__joker-row {
  display: flex;
  gap: 0.75rem;
  width: min(480px, 100%);
  margin: 0 auto;
}

.double-joker {
  flex: 1;
  padding: 0.65rem 1.25rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(135, 92, 255, 0.6);
  background: linear-gradient(135deg, rgba(135, 92, 255, 0.35), rgba(135, 92, 255, 0.15));
  color: #f2e8ff;
  font-weight: 600;
}

.double-joker[data-armed='true'] {
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 10px rgba(135, 92, 255, 0.6);
}

.double-joker:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .quiz-board {
    padding: 0 0.5rem 2rem;
  }

  .quiz-board__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 0.5rem;
  }

  .quiz-board__content > * {
    width: min(680px, 100%);
    padding-right: 0;
    padding-left: 0;
  }

  .quiz-board__round-actions {
    flex-direction: column;
    align-items: stretch;
    margin: 1rem auto 0;
    width: min(680px, 100%);
  }

  .quiz-board__round-actions > * {
    width: 100%;
    text-align: center;
  }

  .quiz-board__joker-row {
    flex-direction: row;
    width: 100%;
    gap: 0.5rem;
  }

  .quiz-board__joker-row .joker-button,
  .quiz-board__joker-row .double-joker {
    padding: 0.55rem 0.75rem;
  }
}

.quiz-board__error {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
  border-radius: 0.75rem;
}

.quiz-board__error button {
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  background: #42b883;
  color: #0f1a24;
  font-weight: 600;
  cursor: pointer;
}

</style>
:deep(.quiz-settings),
:deep(.round-summary),
:deep(.leaderboard) {
  width: min(680px, 100%);
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
}
