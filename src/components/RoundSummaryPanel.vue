<script setup lang="ts">
const props = defineProps<{
  score: number
}>()

const emit = defineEmits<{
  (e: 'restart'): void
}>()
</script>

<template>
  <section class="round-summary">
    <h3>Round finished!</h3>

    <div class="round-summary__score">
      <span>Score</span>
      <strong>{{ props.score }}</strong>
    </div>

    <button type="button" @click="emit('restart')">
      Play another round
    </button>
  </section>
</template>

<style scoped>
.round-summary {
  width: 110%;
  margin: 0 auto;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}

.round-summary__score {
  min-width: 200px;
  padding: 0.85rem 1.35rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.45), rgba(66, 184, 131, 0.15));
  border: 1px solid rgba(66, 184, 131, 0.6);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #f2fff7;
}

.round-summary__score strong {
  font-size: 2rem;
  line-height: 1;
}

button {
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  background: #42b883;
  color: #0f1a24;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  filter: brightness(1.05);
}

@media (max-width: 640px) {
  .round-summary {
    width: 100%;
  }
}
</style>
