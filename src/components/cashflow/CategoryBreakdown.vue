<template>
  <div class="category-breakdown">
    <div class="breakdown-section">
      <h3 class="section-title">📈 Revenus par catégorie</h3>

      <div v-if="incomeEntries.length > 0" class="category-list">
        <div
          v-for="[category, amount] in incomeEntries"
          :key="category"
          class="category-item income"
        >
          <span class="category-name">{{ category }}</span>
          <span class="category-amount">{{ formatCurrency(amount) }}</span>
        </div>
        <div class="category-total">
          <span class="category-name">TOTAL REVENUS</span>
          <span class="category-amount">{{ formatCurrency(totalIncome) }}</span>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>Aucun revenu pour cette période</p>
      </div>
    </div>

    <div class="breakdown-section">
      <h3 class="section-title">📉 Dépenses par catégorie</h3>

      <div v-if="expensesEntries.length > 0" class="category-list">
        <div
          v-for="[category, amount] in expensesEntries"
          :key="category"
          class="category-item expense"
        >
          <span class="category-name">{{ category }}</span>
          <span class="category-amount">{{ formatCurrency(amount) }}</span>
        </div>
        <div class="category-total">
          <span class="category-name">TOTAL DÉPENSES</span>
          <span class="category-amount">{{ formatCurrency(totalExpenses) }}</span>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>Aucune dépense pour cette période</p>
      </div>
    </div>

    <!-- Cash Flow résultant -->
    <div class="cash-flow-result" :class="cashFlowClass">
      <span class="result-label">💰 CASH FLOW DU MOIS</span>
      <span class="result-amount">{{ formatCurrency(cashFlow) }}</span>
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

// Trier les revenus par montant décroissant
const incomeEntries = computed(() => {
  return Object.entries(props.stats.incomeByCategory)
    .sort((a, b) => b[1] - a[1]);
});

// Trier les dépenses par montant décroissant
const expensesEntries = computed(() => {
  return Object.entries(props.stats.expensesByCategory)
    .sort((a, b) => b[1] - a[1]);
});

// Totaux
const totalIncome = computed(() => props.stats.totalIncome);
const totalExpenses = computed(() => props.stats.totalExpenses);
const cashFlow = computed(() => props.stats.cashFlow);

// Classe CSS dynamique pour le cash flow
const cashFlowClass = computed(() => {
  if (props.stats.cashFlow > 0) return 'positive';
  if (props.stats.cashFlow === 0) return 'neutral';
  return 'negative';
});
</script>

<style scoped>
.category-breakdown {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.breakdown-section {
  background: white;
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.category-item:hover {
  background: #f9fafb;
}

.category-item.income {
  border-left: 3px solid var(--success);
}

.category-item.expense {
  border-left: 3px solid var(--danger);
}

.category-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.category-amount {
  font-size: 16px;
  font-weight: 600;
}

.category-item.income .category-amount {
  color: var(--success);
}

.category-item.expense .category-amount {
  color: var(--danger);
}

.category-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 12px;
  margin-top: 12px;
  border-top: 2px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 6px;
}

.category-total .category-name {
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-total .category-amount {
  font-size: 18px;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-style: italic;
}

/* Cash Flow résultant */
.cash-flow-result {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  font-weight: 700;
}

.cash-flow-result.positive {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.cash-flow-result.neutral {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.cash-flow-result.negative {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.result-label {
  font-size: 16px;
  letter-spacing: 1px;
}

.result-amount {
  font-size: 28px;
}

@media (max-width: 1024px) {
  .category-breakdown {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .breakdown-section {
    padding: 16px;
  }

  .category-item {
    padding: 10px;
  }

  .result-amount {
    font-size: 24px;
  }
}
</style>
