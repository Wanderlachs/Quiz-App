<script setup lang="ts">
import { computed } from 'vue'
import type { QuizQuestion } from '../stores/quizStore'

const props = defineProps<{
  question: QuizQuestion
  index: number
  total: number
  selectedAnswer: string | null
  isCorrect: boolean | null
  scoreDelta: number | null
  disabledAnswers: string[]
}>()

const emit = defineEmits<{
  (event: 'answer', value: string): void
}>()

const hasOutcome = computed(() => props.selectedAnswer !== null)
const disabledSet = computed(() => new Set(props.disabledAnswers))
const feedbackText = computed(() => {
  if (props.scoreDelta === null) return ''
  const amount = Math.abs(props.scoreDelta)
  const unit = amount === 1 ? 'point' : 'points'
  if (props.scoreDelta > 0) {
    return `+${amount} ${unit}`
  }
  if (props.scoreDelta < 0) {
    return `-${amount} ${unit}`
  }
  return `0 ${unit}`
})
const feedbackTone = computed(() => {
  if (props.scoreDelta === null) return null
  if (props.scoreDelta > 0) return 'positive'
  if (props.scoreDelta < 0) return 'negative'
  return null
})

function answerClass(answer: string) {
  if (!hasOutcome.value) return null

  const isCorrectAnswer = answer === props.question.correctAnswer
  const isSelected = props.selectedAnswer === answer

  if (isSelected && props.isCorrect) {
    return 'question-card__answer--correct'
  }

  if (isSelected && props.isCorrect === false) {
    return 'question-card__answer--incorrect'
  }

  if (!isSelected && props.isCorrect === false && isCorrectAnswer) {
    return 'question-card__answer--correct'
  }

  return null
}

function handleAnswer(answer: string) {
  if (hasOutcome.value) return
  emit('answer', answer)
}

function isDisabledByJoker(answer: string) {
  return disabledSet.value.has(answer)
}
</script>

<template>
  <article class="question-card">
    <header class="question-card__header">
      <p>Question {{ props.index + 1 }} of {{ props.total }}</p>
      <span>{{ props.question.category }}</span>
    </header>

    <h3 class="question-card__prompt">
      {{ props.question.prompt }}
    </h3>

    <div class="question-card__answers">
      <button
        v-for="answer in props.question.answers"
        :key="answer"
        type="button"
        class="question-card__answer"
        :class="[answerClass(answer), { 'question-card__answer--eliminated': isDisabledByJoker(answer) }]"
        :disabled="hasOutcome || isDisabledByJoker(answer)"
        @click="handleAnswer(answer)"
      >
        {{ answer }}
      </button>
    </div>

    <p
      v-if="hasOutcome"
      class="question-card__feedback"
    >
      <span :class="feedbackTone ?? undefined">{{ feedbackText }}</span>
    </p>
  </article>
</template>

<style scoped>
.question-card {
  background: rgba(24, 24, 26, 0.92);
  border-radius: 1rem;
  padding: 1.25rem;
  width: min(680px, 100%);
  margin: 0 auto;
}

.question-card__header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.75rem;
}

.question-card__prompt {
  font-size: 1.15rem;
  margin: 0 auto 1rem;
  max-width: 540px;
  text-align: center;
  line-height: 1.4;
}

.question-card__answers {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.question-card__answer {
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  padding: 0.75rem;
  text-align: left;
  color: inherit;
  background: rgba(35, 35, 38, 0.88);
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.question-card__answer:disabled {
  cursor: default;
  opacity: 0.9;
}

.question-card__answer:hover:not(:disabled) {
  background: rgba(66, 184, 131, 0.2);
}

.question-card__answer--correct {
  border-color: rgba(66, 184, 131, 0.6);
  background: rgba(66, 184, 131, 0.2);
}

.question-card__answer--incorrect {
  border-color: rgba(247, 95, 95, 0.6);
  background: rgba(247, 95, 95, 0.15);
}

.question-card__answer--eliminated {
  opacity: 0.2;
  border-style: dashed;
  cursor: default;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
}

.question-card__feedback {
  margin-top: 1rem;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: rgba(28, 28, 30, 0.85);
}

.question-card__feedback .positive {
  color: #42b883;
}

.question-card__feedback .negative {
  color: #f75f5f;
}
</style>
