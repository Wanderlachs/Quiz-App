<script setup lang="ts">
import { computed } from 'vue'
import LoginSection from './components/LoginSection.vue'
import QuizBoard from './components/QuizBoard.vue'
import { useQuizStarter } from './helpers/useQuizStarter'

const { userStore, nameInput, startQuiz } = useQuizStarter()

const appClasses = computed(() => ({
  app: true,
  'app--authed': Boolean(userStore.name),
}))
</script>

<template>
  <main :class="appClasses">
    <h1 v-if="!userStore.name">Quiz App</h1>

    <LoginSection
      v-if="!userStore.name"
      v-model="nameInput"
      @start="startQuiz"
    />

    <div
      v-else
      class="app__dashboard"
    >
      <QuizBoard />
    </div>
  </main>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-family: system-ui, sans-serif;
  color: white;
  padding: 2rem 0.5rem 3rem;
  gap: 2rem;
}

.app--authed {
  padding-top: 1rem;
  gap: 1.25rem;
}

.app__dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 0.5rem 2rem;
}
</style>
