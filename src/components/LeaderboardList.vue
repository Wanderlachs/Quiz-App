<script setup lang="ts">
import type { QuizDifficulty } from '../helpers/quizUtils'
import type { LeaderboardMap } from '../stores/quizStore'

const props = defineProps<{
  boards: LeaderboardMap
  activeDifficulty: QuizDifficulty
}>()

const difficulties: QuizDifficulty[] = ['easy', 'medium', 'hard']
const difficultyLabels: Record<QuizDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}
</script>

<template>
  <section class="leaderboard">
    <h3>Leaderboards</h3>

    <div class="leaderboard__columns">
      <div
        v-for="difficulty in difficulties"
        :key="difficulty"
        class="leaderboard__column"
        :data-active="difficulty === props.activeDifficulty"
      >
        <header class="leaderboard__column-header">
          <span>{{ difficultyLabels[difficulty] }}</span>
          <small v-if="difficulty === props.activeDifficulty">Current</small>
        </header>

        <p
          v-if="props.boards[difficulty].length === 0"
          class="leaderboard__empty"
        >
          No entries yet.
        </p>

        <ol v-else class="leaderboard__list">
          <li
            v-for="entry in props.boards[difficulty]"
            :key="`${entry.name}-${entry.achievedAt}`"
          >
            <span class="leaderboard__name">{{ entry.name }}</span>
            <span class="leaderboard__score">{{ entry.score }} pts</span>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.leaderboard {
  width: 100%;
  background: rgba(0, 0, 0, 0.25);
  padding: 1rem;
  border-radius: 0.75rem;
}

.leaderboard__columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.leaderboard__column {
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.leaderboard__column[data-active='true'] {
  border-color: rgba(66, 184, 131, 0.6);
  background: rgba(66, 184, 131, 0.07);
}

.leaderboard__column-header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.leaderboard__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
  margin: 0;
}

.leaderboard__list li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
}

.leaderboard__empty {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.leaderboard__name {
  font-weight: 600;
}
</style>
