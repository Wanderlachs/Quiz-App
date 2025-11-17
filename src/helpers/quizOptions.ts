export interface SelectOption {
  label: string
  value: string
}

export const categoryOptions: SelectOption[] = [
  { label: 'All categories', value: 'any' },
  { label: 'General knowledge', value: '9' },
  { label: 'Books', value: '10' },
  { label: 'Film & TV', value: '11' },
  { label: 'Science & Nature', value: '17' },
  { label: 'Technology', value: '18' },
  { label: 'History', value: '23' },
  { label: 'Sports', value: '21' },
]

export const difficultyOptions: SelectOption[] = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
]
