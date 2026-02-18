<template>
  <div class="category-card">
    <div class="category-info">
      <span
        v-if="category.color"
        class="category-dot"
        :style="{ background: category.color }"
      ></span>
      <div class="category-name">{{ category.name }}</div>
      <span v-if="category.defaultCategory" class="badge-system">🔒 Système</span>
    </div>
    <button
      v-if="!category.defaultCategory"
      class="btn-icon btn-icon-danger"
      @click="emit('delete', category.id)"
      title="Supprimer"
    >
      🗑️
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '@/types'

defineProps<{
  category: Category
}>()

const emit = defineEmits<{
  delete: [id: number]
}>()
</script>

<style scoped>
.category-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-light);
  border-radius: 8px;
  transition: background 0.2s;
}

.category-card:hover {
  background: #e5e7eb;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-name {
  font-weight: 600;
  font-size: 15px;
}

.badge-system {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  background: #e5e7eb;
  padding: 2px 8px;
  border-radius: 10px;
}

.btn-icon {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  opacity: 0.5;
  transition: all 0.2s;
  border-radius: 4px;
}

.btn-icon:hover {
  opacity: 1;
  background: #fee2e2;
}
</style>
