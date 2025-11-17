<script setup lang="ts">
const props = defineProps<{
  name: string
}>()
</script>

<template>
  <section class="greeting-section">
    <h2>Hey {{ props.name }}</h2>
    <p>Select a category and chase the high score.</p>
  </section>
</template>

<style scoped>
.greeting-section {
  text-align: center;
  margin-bottom: 1rem;
}
</style>
