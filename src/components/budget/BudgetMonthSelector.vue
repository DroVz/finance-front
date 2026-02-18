<template>
  <div class="month-selector">
    <button
      class="nav-btn"
      @click="previousMonth"
      title="Mois précédent"
    >‹</button>

    <span class="month-label">{{ formattedMonth }}</span>

    <button
      class="nav-btn"
      @click="nextMonth"
      :disabled="isCurrentMonth"
      :class="{ 'nav-btn--disabled': isCurrentMonth }"
      title="Mois suivant"
    >›</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string  // format YYYY-MM
}>()

const emit = defineEmits<{
  'update:modelValue': [month: string]
}>()

const parseMonth = (value: string): { year: number; month: number } => {
  const [year, month] = value.split('-').map(Number)
  return { year, month }
}

const toMonthString = (year: number, month: number): string => {
  return `${year}-${String(month).padStart(2, '0')}`
}

const getCurrentMonth = (): string => {
  const now = new Date()
  return toMonthString(now.getFullYear(), now.getMonth() + 1)
}

const isCurrentMonth = computed(() => props.modelValue === getCurrentMonth())

const formattedMonth = computed(() => {
  const { year, month } = parseMonth(props.modelValue)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
})

const previousMonth = () => {
  const { year, month } = parseMonth(props.modelValue)
  if (month === 1) {
    emit('update:modelValue', toMonthString(year - 1, 12))
  } else {
    emit('update:modelValue', toMonthString(year, month - 1))
  }
}

const nextMonth = () => {
  if (isCurrentMonth.value) return
  const { year, month } = parseMonth(props.modelValue)
  if (month === 12) {
    emit('update:modelValue', toMonthString(year + 1, 1))
  } else {
    emit('update:modelValue', toMonthString(year, month + 1))
  }
}
</script>

<style scoped>
.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.month-label {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 180px;
  text-align: center;
  text-transform: capitalize;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: white;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  transition: background 0.2s, border-color 0.2s;
}

.nav-btn:hover:not(.nav-btn--disabled) {
  background: var(--bg-light);
  border-color: var(--primary-color);
}

.nav-btn--disabled {
  opacity: 0.3;
  cursor: default;
}
</style>
