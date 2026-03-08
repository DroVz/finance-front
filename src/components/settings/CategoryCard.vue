<template>
  <div class="category-card">
    <div class="category-info">
      <span
        v-if="category.color"
        class="category-dot"
        :style="{ background: category.color }"
      ></span>
      <div class="category-meta">
        <div class="category-name">{{ category.name }}</div>
        <span v-if="category.defaultCategory" class="badge-system">🔒 Système</span>
        <span
          v-else-if="category.type"
          class="badge-type"
          :class="`badge-type--${category.type.toLowerCase()}`"
        >{{ TYPE_LABELS[category.type] }}</span>
        <select
          v-else
          class="type-inline-select"
          @change="setType(($event.target as HTMLSelectElement).value as CategoryType)"
        >
          <option value="" disabled selected>Définir le type</option>
          <option value="CHARGES">Charges</option>
          <option value="LOISIRS">Loisirs & quotidien</option>
          <option value="REVENUS">Revenus</option>
        </select>
      </div>
    </div>
    <button
      v-if="!category.defaultCategory"
      class="btn-icon btn-icon-danger"
      @click="emit('delete', category.id)"
      title="Supprimer"
    >
      <IconTrash :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Category, CategoryType } from '@/types'
import { useCategoryStore } from '@/stores/categoryStore'
import IconTrash from '@/components/base/IconTrash.vue'

const TYPE_LABELS: Record<CategoryType, string> = {
  CHARGES: 'Charges',
  LOISIRS: 'Loisirs',
  REVENUS: 'Revenus'
}

const props = defineProps<{
  category: Category
}>()

const emit = defineEmits<{
  delete: [id: number]
}>()

const categoryStore = useCategoryStore()

const setType = async (type: CategoryType) => {
  await categoryStore.updateCategory(props.category.id, { type })
}
</script>

<style scoped>
.category-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-item);
  border-radius: 8px;
  transition: background 0.2s;
}

.category-card:hover {
  background: var(--bg-hover);
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
  align-self: center;
}

.category-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-name {
  font-weight: 600;
  font-size: 15px;
  line-height: 1;
}

.badge-system {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-hover);
  padding: 2px 8px;
  border-radius: 10px;
}

.badge-type {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.badge-type--charges {
  background: color-mix(in srgb, var(--danger-color) 15%, transparent);
  color: var(--danger-color);
}

.badge-type--loisirs {
  background: color-mix(in srgb, #8b5cf6 15%, transparent);
  color: #8b5cf6;
}

.badge-type--revenus {
  background: color-mix(in srgb, var(--success-color) 15%, transparent);
  color: var(--success-color);
}

.type-inline-select {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  border: 1px dashed var(--border-color);
  background: var(--bg-item);
  color: var(--text-secondary);
  cursor: pointer;
}

.btn-icon {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  border-radius: 4px;
}

.btn-icon:hover {
  background: var(--bg-icon-danger-hover);
  color: var(--color-icon-danger-hover);
}
</style>
