<template>
  <div class="rule-card">
    <div class="rule-header">
      <div class="rule-title-row">
        <h4 class="rule-name">{{ rule.name }}</h4>
        <div class="rule-badges">
          <span class="badge badge-type">{{ ruleTypeLabel }}</span>
          <span class="badge" :class="statusClass">{{ statusLabel }}</span>
        </div>
      </div>
      <div class="rule-actions">
        <button class="btn-icon" @click="emit('edit', rule)" title="Modifier">✏️</button>
        <button class="btn-icon btn-icon-danger" @click="emit('delete', rule.id)" title="Supprimer">🗑️</button>
      </div>
    </div>

    <p v-if="rule.description" class="rule-description">{{ rule.description }}</p>

    <div class="rule-stats">
      <div class="stat">
        <div class="stat-label">{{ ruleLabel }}</div>
        <div class="stat-value stat-primary">{{ formatCurrency(rule.ruleAmount) }}</div>
        <div class="stat-sub">{{ rule.percentage }}% des revenus</div>
      </div>
      <div class="stat">
        <div class="stat-label">{{ currentLabel }}</div>
        <div class="stat-value" :class="statusValueClass">{{ formatCurrency(rule.currentAmount) }}</div>
        <div class="stat-sub">{{ rule.currentPercentage }}% des revenus</div>
      </div>
      <div class="stat">
        <div class="stat-label">{{ remainingLabel }}</div>
        <div class="stat-value" :class="remainingClass">{{ formatCurrency(Math.abs(remainingAmount)) }}</div>
        <div class="stat-sub">{{ remainingHint }}</div>
      </div>
    </div>

    <div class="progress-bar">
      <div
        class="progress-fill"
        :class="progressColorClass"
        :style="{ width: clampedProgress + '%' }"
      ></div>
      <span class="progress-label">{{ clampedProgress }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'
import type { BudgetRule } from '@/types'

const props = defineProps<{
  rule: BudgetRule
}>()

const emit = defineEmits<{
  edit: [rule: BudgetRule]
  delete: [id: number]
}>()

const { formatCurrency } = useFormatters()

const ruleTypeLabel = computed(() => {
  switch (props.rule.ruleType) {
    case 'MAXIMUM': return 'Maximum'
    case 'MINIMUM': return 'Minimum'
    case 'TARGET': return 'Objectif'
    default: return ''
  }
})

// Labels adaptés au type de règle
const statusLabel = computed(() => {
  if (props.rule.status === 'RESPECTED') return 'Respecté'
  switch (props.rule.ruleType) {
    case 'MAXIMUM': return 'Dépassé'
    case 'MINIMUM': return 'Non atteint'
    case 'TARGET': return 'Hors cible'
    default: return 'Dépassé'
  }
})

const ruleLabel = computed(() => {
  switch (props.rule.ruleType) {
    case 'MAXIMUM': return 'Plafond'
    case 'MINIMUM': return 'Objectif minimum'
    case 'TARGET': return 'Cible'
    default: return 'Règle'
  }
})

const currentLabel = computed(() => {
  return props.rule.categoryId ? 'Dépensé ce mois' : 'Épargné ce mois'
})

// Colonne 3 : ce qu'il reste ou le dépassement
const remainingAmount = computed(() => {
  if (props.rule.ruleType === 'MAXIMUM') {
    // Marge restante = plafond - dépensé (positif = il reste, négatif = dépassé)
    return props.rule.ruleAmount - props.rule.currentAmount
  }
  // MINIMUM / TARGET : combien il manque ou combien on dépasse
  return props.rule.currentAmount - props.rule.ruleAmount
})

const remainingLabel = computed(() => {
  if (props.rule.ruleType === 'MAXIMUM') {
    return remainingAmount.value >= 0 ? 'Marge restante' : 'Dépassement'
  }
  return remainingAmount.value >= 0 ? 'Excédent' : 'Il manque'
})

const remainingHint = computed(() => {
  if (props.rule.ruleType === 'MAXIMUM') {
    return remainingAmount.value >= 0 ? 'avant le plafond' : 'au-dessus du plafond'
  }
  return remainingAmount.value >= 0 ? 'au-dessus du minimum' : 'pour atteindre l\'objectif'
})

const remainingClass = computed(() => {
  return remainingAmount.value >= 0 ? 'stat-success' : 'stat-danger'
})

const statusClass = computed(() =>
  props.rule.status === 'RESPECTED' ? 'badge-success' : 'badge-danger'
)

const statusValueClass = computed(() =>
  props.rule.status === 'RESPECTED' ? 'stat-success' : 'stat-danger'
)

// Barre de progression - clampée entre 0 et 100
const clampedProgress = computed(() => {
  if (props.rule.percentage === 0) return 0
  const raw = (Math.max(0, props.rule.currentPercentage) / props.rule.percentage) * 100
  return Math.min(Math.round(raw), 100)
})

const progressColorClass = computed(() =>
  props.rule.status === 'RESPECTED' ? 'progress-success' : 'progress-danger'
)
</script>

<style scoped>
.rule-card {
  background: white;
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08));
  transition: transform 0.2s;
}

.rule-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.rule-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.rule-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.rule-badges {
  display: flex;
  gap: 6px;
}

.badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-type {
  background: #e5e7eb;
  color: #374151;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.rule-actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  padding: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.5;
  transition: opacity 0.2s;
  border-radius: 4px;
}

.btn-icon:hover { opacity: 1; }
.btn-icon-danger:hover { background: #fee2e2; }

.rule-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.rule-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
}

.stat-primary { color: var(--primary-color); }
.stat-success { color: var(--success-color); }
.stat-danger { color: #ef4444; }

.stat-sub {
  font-size: 13px;
  color: var(--text-secondary);
}

.progress-bar {
  position: relative;
  height: 10px;
  background: #e5e7eb;
  border-radius: 5px;
  overflow: visible;
}

.progress-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.6s ease;
  max-width: 100%;
}

.progress-success { background: var(--success-color); }
.progress-danger { background: #ef4444; }

.progress-label {
  position: absolute;
  right: 0;
  top: -18px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}
</style>
