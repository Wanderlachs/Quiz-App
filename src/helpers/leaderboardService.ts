import { createClient } from '@supabase/supabase-js'
import type { LeaderboardEntry, LeaderboardMap } from '../stores/quizStore'
import type { QuizDifficulty } from './quizUtils'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const LEADERBOARD_TABLE = import.meta.env.VITE_SUPABASE_LEADERBOARD_TABLE ?? 'leaderboard'

const supabaseClient =
  typeof SUPABASE_URL === 'string' &&
  SUPABASE_URL.length > 0 &&
  typeof SUPABASE_ANON_KEY === 'string' &&
  SUPABASE_ANON_KEY.length > 0
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null

export const hasRemoteLeaderboard = Boolean(supabaseClient)

const difficulties: QuizDifficulty[] = ['easy', 'medium', 'hard']

function createEmptyLeaderboard(): LeaderboardMap {
  return {
    easy: [],
    medium: [],
    hard: [],
  }
}

export async function fetchRemoteLeaderboards(): Promise<LeaderboardMap | null> {
  if (!supabaseClient) return null

  const map: LeaderboardMap = createEmptyLeaderboard()

  for (const difficulty of difficulties) {
    const { data, error } = await supabaseClient
      .from(LEADERBOARD_TABLE)
      .select('name, score, achieved_at')
      .eq('difficulty', difficulty)
      .order('score', { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    map[difficulty] =
      data?.map((row) => ({
        name: row.name,
        score: row.score,
        achievedAt: row.achieved_at,
      })) ?? []
  }

  return map
}

export async function submitRemoteLeaderboardEntry(
  entry: LeaderboardEntry,
  difficulty: QuizDifficulty,
): Promise<boolean> {
  if (!supabaseClient) return false

  const { error } = await supabaseClient.from(LEADERBOARD_TABLE).insert({
    name: entry.name,
    score: entry.score,
    achieved_at: entry.achievedAt,
    difficulty,
  })

  if (error) {
    throw error
  }

  return true
}
