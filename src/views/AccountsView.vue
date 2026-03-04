<template>
  <div class="accounts-view">
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
          :selected="selectedIds.has(transaction.id)"
          :selection-active="selectionActive"
          @delete="deleteTransaction"
          @edit="handleEdit"
          @toggle-select="handleToggleSelect"
        />
      </div>
    </div>

    <!-- Modale d'édition unitaire -->
    <TransactionEditModal
      :show="editingTransaction !== null"
      :transaction="editingTransaction"
      :categories="categoryStore.categories"
      @close="editingTransaction = null"
      @save="handleSave"
    />

    <!-- Barre d'actions multi-sélection -->
    <TransactionBulkBar
      :selected-count="selectedIds.size"
      :categories="categoryStore.categories"
      @bulk-category-change="handleBulkCategory"
      @clear="selectedIds = new Set()"
    />

    <ConfirmModal
      :show="pendingDeleteTransactionId !== null"
      title="Supprimer cette transaction ?"
      message="Cette action est irréversible."
      @confirm="doDeleteTransaction"
      @cancel="pendingDeleteTransactionId = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAccountStore } from '@/stores/accountStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { dashboardService } from '@/services/dashboardService';
import { useFormatters } from '@/composables/useFormatters';
import type { DashboardStats, Transaction, TransactionDTO, TransactionType } from '@/types';
import LoadingSpinner from '@/components/base/LoadingSpinner.vue';
import ConfirmModal from '@/components/base/ConfirmModal.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import MetricCard from '@/components/cashflow/MetricCard.vue';
import AccountItem from '@/components/accounts/AccountItem.vue';
import TransactionFilters from '@/components/accounts/TransactionFilters.vue';
import TransactionItem from '@/components/accounts/TransactionItem.vue';
import TransactionEditModal from '@/components/accounts/TransactionEditModal.vue';
import TransactionBulkBar from '@/components/accounts/TransactionBulkBar.vue';

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

// État sélection multi
const selectedIds = ref<Set<number>>(new Set());
const selectionActive = computed(() => selectedIds.value.size > 0);

// État édition unitaire
const editingTransaction = ref<Transaction | null>(null);

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
const pendingDeleteTransactionId = ref<number | null>(null);

const deleteTransaction = (id: number) => {
  pendingDeleteTransactionId.value = id;
};

const doDeleteTransaction = async () => {
  if (pendingDeleteTransactionId.value === null) return;
  try {
    await transactionStore.deleteTransaction(pendingDeleteTransactionId.value);
    await accountStore.fetchAccounts();
  } catch {
    // erreur disponible dans transactionStore.error
  } finally {
    pendingDeleteTransactionId.value = null;
  }
};

// Gestion de la sélection multiple
const handleToggleSelect = (id: number) => {
  const next = new Set(selectedIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  selectedIds.value = next;
};

// Ouvre la modale d'édition pour une transaction
const handleEdit = (transaction: Transaction) => {
  editingTransaction.value = transaction;
};

// Sauvegarde une transaction éditée
const handleSave = async (dto: TransactionDTO) => {
  if (!editingTransaction.value) return;
  try {
    await transactionStore.updateTransaction(editingTransaction.value.id, dto);
    await accountStore.fetchAccounts();
    editingTransaction.value = null;
  } catch {
    // erreur disponible dans transactionStore.error
  }
};

// Applique une catégorie en masse sur les transactions sélectionnées
const handleBulkCategory = async (categoryId: number) => {
  try {
    await transactionStore.bulkUpdateCategory([...selectedIds.value], categoryId);
    await accountStore.fetchAccounts();
    selectedIds.value = new Set();
  } catch {
    // erreur disponible dans transactionStore.error
  }
};

// Chargement initial
onMounted(async () => {
  await Promise.all([
    accountStore.fetchAccounts(),
    categoryStore.fetchCategories(),
    loadTransactions()
  ]);

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
