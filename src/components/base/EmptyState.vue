<template>
  <div class="empty-state">
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<style scoped>
.empty-state {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
}
</style>
