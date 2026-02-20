<template>
  <Transition name="slide-up">
    <div v-if="selectedCount > 0" class="bulk-bar">
      <span class="bulk-count">{{ selectedCount }} sélectionnée{{ selectedCount > 1 ? 's' : '' }}</span>

      <div class="bulk-actions">
        <select v-model.number="selectedCategoryId" class="form-select bulk-select">
          <option :value="null" disabled>Changer la catégorie...</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>

        <button
          class="btn btn-primary"
          :disabled="selectedCategoryId === null"
          @click="applyCategory"
        >
          Appliquer
        </button>
      </div>

      <button class="btn btn-ghost" @click="emit('clear')">
        Tout désélectionner
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Category } from '@/types'

const props = defineProps<{
  selectedCount: number
  categories: Category[]
}>()

const emit = defineEmits<{
  'bulk-category-change': [categoryId: number]
  clear: []
}>()

const selectedCategoryId = ref<number | null>(null)

const applyCategory = () => {
  if (selectedCategoryId.value === null) return
  emit('bulk-category-change', selectedCategoryId.value)
  selectedCategoryId.value = null
}
</script>

<style scoped>
.bulk-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  background: #1f2937;
  color: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 100;
  white-space: nowrap;
}

.bulk-count {
  font-weight: 600;
  font-size: 14px;
  min-width: 100px;
}

.bulk-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.bulk-select {
  background: #374151;
  color: white;
  border-color: #4b5563;
  min-width: 200px;
}

.bulk-select option {
  background: #374151;
}

.btn-ghost {
  background: transparent;
  border: 1px solid #4b5563;
  color: #d1d5db;
  padding: 8px 16px;
  border-radius: var(--radius, 8px);
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-ghost:hover {
  background: #374151;
}

/* Transition slide-up */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateX(-50%) translateY(80px);
  opacity: 0;
}
</style>
