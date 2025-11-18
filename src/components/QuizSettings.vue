<script setup lang="ts">
import BaseSelect from './BaseSelect.vue'
import { categoryOptions, difficultyOptions } from '../helpers/quizOptions'
import type { QuizDifficulty } from '../helpers/quizUtils'
import { QUESTIONS_PER_ROUND } from '../stores/quizStore'

const props = defineProps<{
  category: string
  difficulty: QuizDifficulty
  loading: boolean
}>()

const emit = defineEmits<{
  (event: 'update:category', value: string): void
  (event: 'update:difficulty', value: QuizDifficulty): void
  (event: 'start'): void
}>()
</script>

<template>
  <section class="quiz-settings">
    <h3>Quiz Settings</h3>

    <div class="quiz-settings__grid">
      <label class="quiz-settings__field">
        <span>Category</span>
        <BaseSelect
          :model-value="props.category"
          :options="categoryOptions"
          @update:modelValue="emit('update:category', $event)"
        />
      </label>

      <label class="quiz-settings__field">
        <span>Difficulty</span>
        <BaseSelect
          :model-value="props.difficulty"
          :options="difficultyOptions"
          @update:modelValue="emit('update:difficulty', $event as QuizDifficulty)"
        />
      </label>
    </div>

    <p class="quiz-settings__note">
      Each round contains {{ QUESTIONS_PER_ROUND }} questions.
    </p>

    <button
      class="quiz-settings__start"
      :disabled="props.loading"
      @click="emit('start')"
    >
      {{ props.loading ? 'Loading...' : 'Start quiz' }}
    </button>
  </section>
</template>

<style scoped>
.quiz-settings {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.quiz-settings__grid {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 0.5rem;
}

.quiz-settings__field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.9rem;
}

.quiz-settings__note {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 0.75rem;
}

.quiz-settings__start {
  display: block;
  margin: 0 auto;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  background: #42b883;
  color: #0f1a24;
  font-weight: 600;
  cursor: pointer;
}

.quiz-settings__start:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
