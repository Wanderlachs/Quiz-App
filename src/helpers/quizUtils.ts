export type QuizDifficulty = 'easy' | 'medium' | 'hard'

export function decodeHtmlEntities(value: string): string {
  const parser = new DOMParser()
  const decoded = parser.parseFromString(value, 'text/html').documentElement
  return decoded ? decoded.textContent ?? value : value
}

export function shuffleArray<T>(items: T[]): T[] {
  return [...items]
    .map((item) => ({ item, weight: Math.random() }))
    .sort((a, b) => a.weight - b.weight)
    .map((entry) => entry.item)
}
