<template>
  <div class="cash-flow-summary">
    <h3 class="section-title">Résumé de la période</h3>

    <div class="stats-grid">
      <!-- Revenus -->
      <div class="stat-card income">
        <div class="stat-label">📈 Revenus</div>
        <div class="stat-value">{{ formatCurrency(stats.totalIncome) }}</div>
      </div>

      <!-- Dépenses -->
      <div class="stat-card expenses">
        <div class="stat-label">📉 Dépenses</div>
        <div class="stat-value">{{ formatCurrency(stats.totalExpenses) }}</div>
      </div>

      <!-- Cash Flow -->
      <div class="stat-card cash-flow" :class="cashFlowClass">
        <div class="stat-label">💰 Cash Flow</div>
        <div class="stat-value">{{ formatCurrency(stats.cashFlow) }}</div>
        <div class="stat-subtitle">{{ cashFlowMessage }}</div>
      </div>

      <!-- Taux d'épargne -->
      <div class="stat-card savings-rate">
        <div class="stat-label">📊 Taux d'épargne</div>
        <div class="stat-value">{{ stats.savingsRate.toFixed(2) }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CashFlowStats } from '@/types';
import { useFormatters } from '@/composables/useFormatters';

const props = defineProps<{
  stats: CashFlowStats
}>();

const { formatCurrency } = useFormatters();

// Classe CSS dynamique selon le cash flow
const cashFlowClass = computed(() => {
  if (props.stats.cashFlow > 500) return 'positive-high';
  if (props.stats.cashFlow > 0) return 'positive';
  if (props.stats.cashFlow > -50) return 'neutral';
  return 'negative';
});

// Message dynamique selon le cash flow
const cashFlowMessage = computed(() => {
  if (props.stats.cashFlow > 500) return '✅ Excellent mois !';
  if (props.stats.cashFlow > 0) return '✅ Mois positif';
  if (props.stats.cashFlow > -50) return '⚠️ À l\'équilibre';
  if (props.stats.cashFlow > -500) return '⚠️ Attention';
  return '🚨 Alerte';
});
</script>

<style scoped>
.cash-flow-summary {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-subtitle {
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}

/* Couleurs spécifiques */
.income .stat-value {
  color: var(--success);
}

.expenses .stat-value {
  color: var(--danger);
}

/* Cash Flow - Couleurs dynamiques */
.cash-flow.positive-high {
  background: #d1fae5;
  border-left: 4px solid #10b981;
}

.cash-flow.positive-high .stat-value {
  color: #047857;
}

.cash-flow.positive {
  background: #ecfdf5;
  border-left: 4px solid #6ee7b7;
}

.cash-flow.positive .stat-value {
  color: #059669;
}

.cash-flow.neutral {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
}

.cash-flow.neutral .stat-value {
  color: #d97706;
}

.cash-flow.negative {
  background: #fee2e2;
  border-left: 4px solid #ef4444;
}

.cash-flow.negative .stat-value {
  color: #dc2626;
}

.savings-rate .stat-value {
  color: var(--primary);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>
