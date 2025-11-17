import { defineStore } from 'pinia'

const USER_STORAGE_KEY = 'quizApp.userName'

function loadStoredName() {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(USER_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function persistName(value: string) {
  if (typeof window === 'undefined') return
  try {
    if (value) {
      localStorage.setItem(USER_STORAGE_KEY, value)
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  } catch {
    // ignore
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    name: loadStoredName(),
    score: 0 as number,
  }),
  actions: {
    setName(newName: string) {
      this.name = newName
      persistName(newName)
    },
    clearName() {
      this.name = ''
      persistName('')
    },
    resetScore() {
      this.score = 0
    },
    addScore(amount: number) {
      this.score = Math.max(0, this.score + amount)
    },
  },
})
