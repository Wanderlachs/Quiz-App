<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'start'): void
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>

<template>
  <section class="login-section">
    <p>Please enter your name to get started:</p>

    <div class="login-section__controls">
      <input
        v-model="inputValue"
        type="text"
        placeholder="Your name"
        @keyup.enter="emit('start')"
      />

      <button @click="emit('start')">
        Join Quiz
      </button>
    </div>
  </section>
</template>

<style scoped>
.login-section {
  width: min(220px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: center;
  align-items: center;
}

.login-section__controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 220px;
}

input {
  flex: 1;
  min-width: 0;
  padding: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

@media (max-width: 520px) {
  .login-section__controls {
    flex-direction: column;
    align-items: stretch;
  }

  button {
    width: 100%;
  }
}
</style>
