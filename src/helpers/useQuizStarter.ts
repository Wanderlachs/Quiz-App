import { ref } from 'vue'
import { useQuizStore } from '../stores/quizStore'
import { useUserStore } from '../stores/userStore'

export function useQuizStarter() {
  const userStore = useUserStore()
  const quizStore = useQuizStore()
  const nameInput = ref('')

  function startQuiz() {
    const trimmedName = nameInput.value.trim()
    if (!trimmedName) return

    userStore.setName(trimmedName)
    nameInput.value = ''
    userStore.resetScore()
    quizStore.resetQuizProgress()
  }

  return {
    nameInput,
    startQuiz,
    userStore,
  }
}
