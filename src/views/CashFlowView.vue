<template>
  <div class="cash-flow-view">
    <div class="page-header">
      <h1>💰 Cash Flow</h1>
      <p class="subtitle">Visualisez si vous restez dans le positif mois après mois</p>
    </div>

    <!-- Filtres -->
    <div class="filters-card">
      <div class="filters">
        <!-- Filtre période -->
        <div class="filter-group">
          <label class="filter-label">📅 Période</label>
          <select v-model="selectedPeriod" @change="handlePeriodChange" class="filter-select">
            <option value="current-month">Mois en cours</option>
            <option value="last-month">Mois dernier</option>
            <option value="last-3-months">3 derniers mois</option>
            <option value="current-year">Année en cours</option>
            <option value="custom">Personnalisée</option>
          </select>
        </div>

        <!-- Dates personnalisées -->
        <div v-if="selectedPeriod === 'custom'" class="filter-group custom-dates">
          <div>
            <label class="filter-label">Du</label>
            <input v-model="customStartDate" type="date" class="filter-input" />
          </div>
          <div>
            <label class="filter-label">Au</label>
            <input v-model="customEndDate" type="date" class="filter-input" />
          </div>
        </div>

        <!-- Filtre compte -->
        <div class="filter-group">
          <label class="filter-label">🏦 Compte</label>
          <select v-model="selectedAccountId" @change="loadData" class="filter-select">
            <option :value="null">Tous les comptes</option>
            <option
              v-for="account in accounts"
              :key="account.id"
              :value="account.id"
            >
              {{ account.name }}
            </option>
          </select>
        </div>

        <!-- Bouton Appliquer (pour période personnalisée) -->
        <button
          v-if="selectedPeriod === 'custom'"
          @click="loadData"
          class="btn btn-primary"
        >
          Appliquer
        </button>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="loader-container">
      <div class="loader"></div>
      <p>Chargement des données...</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>

    <!-- Contenu -->
    <div v-else-if="stats">
      <!-- Résumé -->
      <CashFlowSummary :stats="stats" />

      <!-- Graphique -->
      <CashFlowChart
        :monthly-data="monthlyData"
        :chart-months="chartMonths"
        @change-range="changeChartRange"
      />

      <!-- Breakdown par catégorie -->
      <CategoryBreakdown :stats="stats" />
    </div>

    <!-- État vide -->
    <div v-else class="empty-state">
      <p>📊 Aucune donnée disponible pour la période sélectionnée</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCashFlowStore } from '@/stores/cashFlowStore';
import { useAccountStore } from '@/stores/accountStore';
import CashFlowSummary from '@/components/cashflow/CashFlowSummary.vue';
import CashFlowChart from '@/components/cashflow/CashFlowChart.vue';
import CategoryBreakdown from '@/components/cashflow/CategoryBreakdown.vue';

const cashFlowStore = useCashFlowStore();
const accountStore = useAccountStore();

// State
const selectedPeriod = ref('current-month');
const selectedAccountId = ref<number | null>(null);
const customStartDate = ref('');
const customEndDate = ref('');
const chartMonths = ref(12);

const chartRangeOptions = [
  { label: '6 mois', value: 6 },
  { label: '1 an', value: 12 },
  { label: '2 ans', value: 24 },
  { label: '3 ans', value: 36 }
];

// Computed
const stats = computed(() => cashFlowStore.stats);
const monthlyData = computed(() => cashFlowStore.monthlyData);
const loading = computed(() => cashFlowStore.loading);
const error = computed(() => cashFlowStore.error);
const accounts = computed(() => accountStore.accounts);

// Calculer les dates selon la période sélectionnée
const getPeriodDates = (): { start: string; end: string } => {
  const now = new Date();
  let start: Date;
  let end: Date = now;

  switch (selectedPeriod.value) {
    case 'current-month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last-month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'last-3-months':
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case 'current-year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      return {
        start: customStartDate.value,
        end: customEndDate.value
      };
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

// Charger les données
const loadData = async () => {
  const { start, end } = getPeriodDates();

  // Charger les stats
  await cashFlowStore.fetchStats(start, end, selectedAccountId.value);

  // Charger les données mensuelles
  await cashFlowStore.fetchMonthly(chartMonths.value, selectedAccountId.value);
};

const changeChartRange = async (months: number) => {
  chartMonths.value = months;
  await cashFlowStore.fetchMonthly(months, selectedAccountId.value);
};

// Handler changement de période
const handlePeriodChange = () => {
  if (selectedPeriod.value !== 'custom') {
    loadData();
  }
};

// Initialisation
onMounted(async () => {
  // Charger les comptes pour le filtre
  await accountStore.fetchAccounts();

  // Charger les données initiales
  await loadData();
});
</script>

<style scoped>
.cash-flow-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

/* Filtres */
.filters-card {
  background: white;
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 32px;
}

.filters {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 200px;
}

.filter-group.custom-dates {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select,
.filter-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select {
  cursor: pointer;
  background: white;
}

/* Loader */
.loader-container {
  text-align: center;
  padding: 60px 20px;
}

.loader {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loader-container p {
  margin-top: 16px;
  color: var(--text-secondary);
  font-style: italic;
}

/* Erreur */
.error-message {
  background: #fee2e2;
  color: #991b1b;
  padding: 16px 20px;
  border-radius: var(--radius);
  border: 1px solid #fecaca;
  text-align: center;
  font-weight: 500;
}

/* État vide */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
  font-size: 16px;
  font-style: italic;
}

@media (max-width: 768px) {
  .cash-flow-view {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: auto;
  }

  .filter-group.custom-dates {
    flex-direction: column;
  }
}
</style>
