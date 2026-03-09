<template>
  <div class="cash-flow-view">
    <!-- Sélecteur de mois — pilote stats + catégories -->
    <BudgetMonthSelector
      v-model="selectedMonth"
      @update:modelValue="onMonthChange"
    />

    <!-- Stats du mois sélectionné -->
    <div v-if="loadingStats" class="loader-container">
      <div class="loader"></div>
      <p>Chargement des données...</p>
    </div>
    <div v-else-if="errorStats" class="error-message">
      ⚠️ {{ errorStats }}
    </div>
    <template v-else-if="stats">
      <CashFlowSummary :stats="stats" :class="{ 'soft-loading': updatingStats }" />
    </template>
    <div v-else class="empty-state">
      <p>📊 Aucune donnée disponible pour {{ formattedMonth }}</p>
    </div>

    <!-- Graphique de tendance — range géré par ses pills, mois sélectionné mis en évidence -->
    <div v-if="loadingChart" class="loader-container">
      <div class="loader"></div>
    </div>
    <CashFlowChart
      v-else
      :monthly-data="monthlyData"
      :chart-months="chartMonths"
      :selected-month="selectedMonth"
      @change-range="changeChartRange"
      @select-month="onSelectMonth"
    />

    <!-- Breakdown par type (CHARGES / LOISIRS / REVENUS) -->
    <TypeBreakdown v-if="stats" :stats="stats" :class="{ 'soft-loading': updatingStats }" />

    <!-- Breakdown catégories du mois sélectionné -->
    <CategoryBreakdown v-if="stats" :stats="stats" :selected-month="selectedMonth" :class="{ 'soft-loading': updatingStats }" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCashFlowStore } from '@/stores/cashFlowStore';
import CashFlowSummary from '@/components/cashflow/CashFlowSummary.vue';
import CashFlowChart from '@/components/cashflow/CashFlowChart.vue';
import CategoryBreakdown from '@/components/cashflow/CategoryBreakdown.vue';
import TypeBreakdown from '@/components/cashflow/TypeBreakdown.vue';
import BudgetMonthSelector from '@/components/budget/BudgetMonthSelector.vue';

const cashFlowStore = useCashFlowStore();

const chartMonths = ref(12);
const loadingChart = ref(true);
const loadingStats = ref(true);   // premier chargement uniquement — masque le contenu
const updatingStats = ref(false); // changements de mois — opacité légère, pas de masquage
const errorStats = ref<string | null>(null);

const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const selectedMonth = ref(getCurrentMonth());

const stats = computed(() => cashFlowStore.stats);
const monthlyData = computed(() => cashFlowStore.monthlyData);

const formattedMonth = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
});

const monthToDates = (month: string): { start: string; end: string } => {
  const [year, m] = month.split('-').map(Number);
  const start = new Date(year, m - 1, 1);
  const end = new Date(year, m, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

const loadStats = async (soft = false) => {
  if (soft) {
    updatingStats.value = true;
  } else {
    loadingStats.value = true;
  }
  errorStats.value = null;
  try {
    const { start, end } = monthToDates(selectedMonth.value);
    await cashFlowStore.fetchStats(start, end, null);
  } catch (e: any) {
    errorStats.value = e.response?.data?.message || 'Erreur lors du chargement des statistiques';
  } finally {
    loadingStats.value = false;
    updatingStats.value = false;
  }
};

const loadChart = async () => {
  loadingChart.value = true;
  try {
    await cashFlowStore.fetchMonthly(chartMonths.value, null);
  } finally {
    loadingChart.value = false;
  }
};

const onMonthChange = async () => {
  await loadStats(true);
};

const onSelectMonth = async (month: string) => {
  selectedMonth.value = month;
  await loadStats(true);
};

const changeChartRange = async (months: number) => {
  chartMonths.value = months;
  await loadChart();
};

onMounted(async () => {
  await Promise.all([loadStats(), loadChart()]);
});
</script>

<style scoped>
.cash-flow-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cash-flow-view :deep(.month-selector) {
  margin-bottom: 0;
}

.soft-loading {
  opacity: 0.45;
  pointer-events: none;
  transition: opacity 0.2s;
}

.subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

.loader-container {
  text-align: center;
  padding: 60px 20px;
}

.loader {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 4px solid var(--bg-hover);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loader-container p {
  margin-top: 16px;
  color: var(--text-secondary);
  font-style: italic;
}

.error-message {
  background: var(--bg-danger-tint);
  color: var(--text-danger-tint);
  padding: 16px 20px;
  border-radius: var(--radius);
  border: 1px solid var(--danger-color);
  text-align: center;
  font-weight: 500;
  margin-bottom: 24px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-size: 16px;
  font-style: italic;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .cash-flow-view {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }
}
</style>
