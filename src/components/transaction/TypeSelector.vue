<template>
  <div class="type-selector">
    <button
      v-for="type in types"
      :key="type.value"
      :class="['type-btn', { active: modelValue === type.value }]"
      @click="emit('update:modelValue', type.value)"
    >
      <span class="type-icon">{{ type.icon }}</span>
      <span>{{ type.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { TransactionType } from '@/types'

defineProps<{
  modelValue: TransactionType
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TransactionType]
}>()

const types = [
  { value: TransactionType.INCOME, label: 'Revenu', icon: '📈' },
  { value: TransactionType.EXPENSE, label: 'Dépense', icon: '📉' },
  { value: TransactionType.TRANSFER, label: 'Virement', icon: '🔄' }
]
</script>

<style scoped>
.type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
  font-weight: 500;
}

.type-btn:hover {
  border-color: var(--primary-color);
  background: var(--bg-selected);
}

.type-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.type-icon {
  font-size: 32px;
}
</style>
