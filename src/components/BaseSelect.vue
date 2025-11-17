<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { SelectOption } from '../helpers/quizOptions'

const props = defineProps<{
  modelValue: string
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const rootEl = ref<HTMLElement | null>(null)

const selectedOption = computed(() => props.options.find((option) => option.value === props.modelValue))
const displayLabel = computed(
  () => selectedOption.value?.label ?? props.placeholder ?? 'Select an option',
)

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

function selectOption(value: string) {
  emit('update:modelValue', value)
  closeDropdown()
}

function handleClickOutside(event: MouseEvent) {
  if (!rootEl.value) return
  if (!rootEl.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div
    ref="rootEl"
    class="base-select"
    :data-open="isOpen"
    :data-disabled="props.disabled"
  >
    <button
      type="button"
      class="base-select__trigger"
      :disabled="props.disabled"
      @click="toggleDropdown"
    >
      <span>{{ displayLabel }}</span>
      <svg
        class="base-select__chevron"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M12 15.5a1 1 0 0 1-.71-.29l-5-5a1 1 0 1 1 1.42-1.42L12 13.08l4.29-4.29a1 1 0 0 1 1.42 1.42l-5 5a1 1 0 0 1-.71.29"
        />
      </svg>
    </button>

    <ul
      v-if="isOpen"
      class="base-select__list"
    >
      <li
        v-for="option in props.options"
        :key="option.value"
      >
        <button
          type="button"
          class="base-select__option"
          :data-selected="option.value === props.modelValue"
          @click="selectOption(option.value)"
        >
          {{ option.label }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.base-select {
  position: relative;
  width: 100%;
}

.base-select__trigger {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(28, 28, 30, 0.92);
  color: #f5f5f5;
  font-size: 0.95rem;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.base-select__trigger:focus-visible {
  outline: 2px solid rgba(66, 184, 131, 0.8);
  outline-offset: 2px;
}

.base-select__trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-select__chevron {
  transition: transform 0.2s ease;
}

.base-select[data-open='true'] .base-select__chevron {
  transform: rotate(180deg);
}

.base-select__list {
  position: absolute;
  top: calc(100% + 0.35rem);
  left: 0;
  right: 0;
  background: rgba(28, 28, 30, 0.97);
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
  max-height: 220px;
  overflow-y: auto;
  padding: 0.35rem;
  z-index: 10;
  backdrop-filter: blur(12px);
}

.base-select__option {
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.6rem;
  border-radius: 0.45rem;
  border: none;
  background: transparent;
  color: #f7fafc;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.base-select__option:hover {
  background: rgba(66, 184, 131, 0.2);
}

.base-select__option[data-selected='true'] {
  background: rgba(66, 184, 131, 0.25);
  color: #d7ffe3;
}
</style>
