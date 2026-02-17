<template>
  <div class="accounts-view">
    <h2 class="page-title">Vue d'ensemble des comptes</h2>

    <!-- KPI Cards -->
    <div class="kpi-cards">
      <MetricCard
        icon="💰"
        label="Solde total"
        :value="formatCurrency(totalBalance)"
        variant="primary"
      />

      <MetricCard
        icon="📈"
        label="Revenus ce mois"
        :value="formatCurrency(stats?.totalIncome || 0)"
        variant="success"
      />

      <MetricCard
        icon="📉"
        label="Dépenses ce mois"
        :value="formatCurrency(stats?.totalExpenses || 0)"
        variant="danger"
      />
    </div>

    <!-- Soldes par compte -->
    <div class="card">
      <h3 class="section-title">Soldes par compte</h3>
      <div class="accounts-list">
        <AccountItem
          v-for="account in accountStore.accounts"
          :key="account.id"
          :account="account"
        />

        <EmptyState
          v-if="accountStore.accounts.length === 0"
          message="Aucun compte. Créez-en un dans les Paramètres."
        />
      </div>
    </div>

    <!-- Filtres -->
    <div class="card">
      <h3 class="section-title">Filtres</h3>
      <TransactionFilters
        v-model:selected-account-id="selectedAccountId"
        v-model:selected-type="selectedType"
        v-model:selected-category-id="selectedCategoryId"
        v-model:search-description="searchDescription"
        :accounts="accountStore.accounts"
        :categories="categoryStore.categories"
        @account-change="loadTransactions"
      />
    </div>

    <!-- Historique des transactions -->
    <div class="card">
      <h3 class="section-title">Historique des transactions</h3>

      <LoadingSpinner v-if="loading" />

      <EmptyState
        v-else-if="filteredTransactions.length === 0"
        message="Aucune transaction trouvée."
      />

      <div v-else class="transactions-list">
        <TransactionItem
          v-for="transaction in filteredTransactions"
          :key="transaction.id"
          :transaction="transaction"
          @delete="deleteTransaction"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAccountStore } from '@/stores/accountStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { dashboardService } from '@/services/dashboardService';
import { useFormatters } from '@/composables/useFormatters';
import type { DashboardStats, TransactionType } from '@/types';
import LoadingSpinner from '@/components/base/LoadingSpinner.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import MetricCard from '@/components/cashflow/MetricCard.vue';
import AccountItem from '@/components/accounts/AccountItem.vue';
import TransactionFilters from '@/components/accounts/TransactionFilters.vue';
import TransactionItem from '@/components/accounts/TransactionItem.vue';

const { formatCurrency } = useFormatters();

const accountStore = useAccountStore();
const categoryStore = useCategoryStore();
const transactionStore = useTransactionStore();

const loading = ref(false);
const selectedAccountId = ref<number | null>(null);
const selectedType = ref<TransactionType | null>(null);
const selectedCategoryId = ref<number | null>(null);
const searchDescription = ref('');
const stats = ref<DashboardStats | null>(null);

const totalBalance = computed(() => accountStore.getTotalBalance());

const filteredTransactions = computed(() => {
  let transactions = transactionStore.transactions;

  // Filtre par type avec gestion spéciale pour les virements
  if (selectedType.value) {
    if (selectedType.value === 'TRANSFER') {
      // Les virements sont identifiés par linkedTransactionId non null
      transactions = transactions.filter(t => t.linkedTransactionId !== null);
    } else {
      // Pour INCOME et EXPENSE, filtre normal par type
      transactions = transactions.filter(t => t.type === selectedType.value);
    }
  }

  // Filtre par catégorie
  if (selectedCategoryId.value) {
    transactions = transactions.filter(t => t.categoryId === selectedCategoryId.value);
  }

  // Filtre par description
  if (searchDescription.value.trim()) {
    const search = searchDescription.value.trim().toLowerCase();
    transactions = transactions.filter(t =>
      t.description?.toLowerCase().includes(search)
    );
  }

  return transactions;
});

// Charge les transactions
const loadTransactions = async () => {
  loading.value = true;
  try {
    if (selectedAccountId.value) {
      await transactionStore.fetchByAccount(selectedAccountId.value);
    } else {
      await transactionStore.fetchTransactions();
    }
  } finally {
    loading.value = false;
  }
};

// Supprime une transaction
const deleteTransaction = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
    return;
  }

  try {
    await transactionStore.deleteTransaction(id);
    await accountStore.fetchAccounts(); // Recharge les soldes
    alert('Transaction supprimée avec succès');
  } catch (error: any) {
    alert(error.response?.data?.message || 'Erreur lors de la suppression');
  }
};

// Chargement initial
onMounted(async () => {
  await loadTransactions();

  try {
    stats.value = await dashboardService.getCurrentMonthStats();
  } catch (error) {
    console.error('Erreur lors du chargement des stats:', error);
  }
});
</script>

<style scoped>
.accounts-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 24px;
}

.kpi-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.accounts-view > .card {
  margin-bottom: 20px;
}

.accounts-view > .card:last-child {
  margin-bottom: 0;
}
</style>
