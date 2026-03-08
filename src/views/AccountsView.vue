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
          :active="selectedAccountId === account.id"
          @select="handleAccountSelect"
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
    <div class="card" ref="transactionsCard">
      <div class="transactions-header">
        <h3 class="section-title">Historique des transactions</h3>
        <span v-if="filteredTransactions.length > 0" class="tx-count">
          {{ filteredTransactions.length }} transaction{{ filteredTransactions.length > 1 ? 's' : '' }}
        </span>
      </div>

      <LoadingSpinner v-if="loading" />

      <EmptyState
        v-else-if="filteredTransactions.length === 0"
        message="Aucune transaction trouvée."
      />

      <template v-else>
        <div class="transactions-list">
          <TransactionItem
            v-for="transaction in paginatedTransactions"
            :key="transaction.id"
            :transaction="transaction"
            :selected="selectedIds.has(transaction.id)"
            :selection-active="selectionActive"
            @delete="deleteTransaction"
            @edit="handleEdit"
            @toggle-select="handleToggleSelect"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination" ref="paginationBar">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="goToPage(1)"
            title="Première page"
          >«</button>
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
            title="Page précédente"
          >‹</button>

          <template v-for="p in pageNumbers" :key="p">
            <span v-if="p === '…'" class="page-ellipsis">…</span>
            <button
              v-else
              class="page-btn"
              :class="{ 'page-active': p === currentPage }"
              @click="goToPage(p as number)"
            >{{ p }}</button>
          </template>

          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
            title="Page suivante"
          >›</button>
          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="goToPage(totalPages)"
            title="Dernière page"
          >»</button>
        </div>
      </template>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';
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
const transactionsCard = ref<HTMLElement | null>(null);
const selectedType = ref<TransactionType | null>(null);
const selectedCategoryId = ref<number | null>(null);
const searchDescription = ref('');
const stats = ref<DashboardStats | null>(null);

// État sélection multi
const selectedIds = ref<Set<number>>(new Set());
const selectionActive = computed(() => selectedIds.value.size > 0);

// État édition unitaire
const editingTransaction = ref<Transaction | null>(null);

// Pagination
const PAGE_SIZE = 20;
const currentPage = ref(1);
const paginationBar = ref<HTMLElement | null>(null);

const goToPage = (page: number) => {
  const paginationViewportTop = paginationBar.value?.getBoundingClientRect().top ?? 0;
  const scrollYBefore = window.scrollY;
  currentPage.value = page;
  nextTick(() => {
    const newPaginationViewportTop = paginationBar.value?.getBoundingClientRect().top ?? paginationViewportTop;
    const delta = newPaginationViewportTop - paginationViewportTop;
    window.scrollTo({ top: Math.max(0, scrollYBefore + delta) });
  });
};

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

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTransactions.value.length / PAGE_SIZE)));

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredTransactions.value.slice(start, start + PAGE_SIZE);
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const current = currentPage.value;
  const pages: (number | '…')[] = [1];
  if (current > 3) pages.push('…');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
});

// Reset page + sélection quand les filtres changent
watch(filteredTransactions, () => {
  currentPage.value = 1;
  selectedIds.value = new Set();
});

const smoothScrollTo = (target: number, duration = 600) => {
  const start = window.scrollY;
  const distance = target - start;
  const startTime = performance.now();
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, start + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

// Clic sur une carte compte → filtre + scroll
const handleAccountSelect = async (id: number) => {
  if (selectedAccountId.value === id) {
    selectedAccountId.value = null;
  } else {
    selectedAccountId.value = id;
  }
  await loadTransactions();
  nextTick(() => {
    if (!transactionsCard.value) return;
    const headerHeight = document.querySelector('header')?.offsetHeight ?? 0;
    const top = transactionsCard.value.getBoundingClientRect().top + window.scrollY - headerHeight;
    smoothScrollTo(top);
  });
};

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

.transactions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.transactions-header .section-title {
  margin-bottom: 0;
}

.tx-count {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.page-btn.page-active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  font-weight: 600;
}

.page-ellipsis {
  width: 36px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 36px;
}

.accounts-view > .card {
  margin-bottom: 20px;
}

.accounts-view > .card:last-child {
  margin-bottom: 0;
}
</style>
