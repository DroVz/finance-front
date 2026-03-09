<template>
  <div class="transactions-view">
    <!-- Sélecteur de mois — même composant que CashFlow et Budget -->
    <BudgetMonthSelector v-model="selectedMonth" />

    <!-- Filtres type CHARGES / LOISIRS / REVENUS -->
    <div class="type-pills">
      <button
        class="pill"
        :class="{ active: selectedCategoryType === null }"
        @click="selectCategoryType(null)"
      >Tout</button>
      <button
        v-for="t in CATEGORY_TYPES"
        :key="t.value"
        class="pill"
        :class="{ active: selectedCategoryType === t.value }"
        :style="selectedCategoryType === t.value
          ? { background: t.color, borderColor: t.color, color: '#fff' }
          : { borderColor: t.color, color: t.color }"
        @click="selectCategoryType(t.value)"
      >{{ t.label }}</button>
    </div>

    <!-- Filtres avancés — catégories filtrées selon la pill active -->
    <div class="card">
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

    <!-- Liste des transactions -->
    <div class="card">
      <div class="transactions-header">
        <h3 class="section-title">
          {{ filteredTransactions.length }} transaction{{ filteredTransactions.length !== 1 ? 's' : '' }}
        </h3>
      </div>

      <LoadingSpinner v-if="loading" />

      <EmptyState
        v-else-if="filteredTransactions.length === 0"
        message="Aucune transaction pour cette période."
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
          <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(1)" title="Première page">«</button>
          <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)" title="Page précédente">‹</button>

          <template v-for="p in pageNumbers" :key="p">
            <span v-if="p === '…'" class="page-ellipsis">…</span>
            <button
              v-else
              class="page-btn"
              :class="{ 'page-active': p === currentPage }"
              @click="goToPage(p as number)"
            >{{ p }}</button>
          </template>

          <button class="page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)" title="Page suivante">›</button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="goToPage(totalPages)" title="Dernière page">»</button>
        </div>
      </template>
    </div>

    <!-- Modale d'édition -->
    <TransactionEditModal
      :show="editingTransaction !== null"
      :transaction="editingTransaction"
      :categories="categoryStore.categories"
      @close="editingTransaction = null"
      @save="handleSave"
    />

    <!-- Barre multi-sélection -->
    <TransactionBulkBar
      :selected-count="selectedIds.size"
      :categories="categoryStore.categories"
      @bulk-category-change="handleBulkCategory"
      @clear="selectedIds = new Set()"
    />

    <ConfirmModal
      :show="pendingDeleteId !== null"
      title="Supprimer cette transaction ?"
      message="Cette action est irréversible."
      @confirm="doDelete"
      @cancel="pendingDeleteId = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useAccountStore } from '@/stores/accountStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useTransactionStore } from '@/stores/transactionStore';
import type { Transaction, TransactionDTO, TransactionType } from '@/types';
import LoadingSpinner from '@/components/base/LoadingSpinner.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import ConfirmModal from '@/components/base/ConfirmModal.vue';
import BudgetMonthSelector from '@/components/budget/BudgetMonthSelector.vue';
import TransactionFilters from '@/components/accounts/TransactionFilters.vue';
import TransactionItem from '@/components/accounts/TransactionItem.vue';
import TransactionEditModal from '@/components/accounts/TransactionEditModal.vue';
import TransactionBulkBar from '@/components/accounts/TransactionBulkBar.vue';

const route = useRoute();
const accountStore = useAccountStore();
const categoryStore = useCategoryStore();
const transactionStore = useTransactionStore();

const CATEGORY_TYPES = [
  { value: 'CHARGES', label: 'Charges', color: 'var(--danger-color, #ef4444)' },
  { value: 'LOISIRS', label: 'Loisirs', color: '#8b5cf6' },
  { value: 'REVENUS', label: 'Revenus', color: 'var(--success-color, #10b981)' },
] as const;

// --- Mois (format YYYY-MM, même convention que BudgetMonthSelector) ---
const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
const selectedMonth = ref(getCurrentMonth());

// --- Filtres ---
const selectedAccountId = ref<number | null>(null);
const selectedType = ref<TransactionType | null>(null);
const selectedCategoryId = ref<number | null>(null);
const searchDescription = ref('');
const selectedCategoryType = ref<string | null>(null);

// Sélectionner une pill type → reset la catégorie à "toutes"
const selectCategoryType = (type: string | null) => {
  selectedCategoryType.value = type;
  selectedCategoryId.value = null;
};

// Sélectionner une catégorie → active la pill du type correspondant
watch(selectedCategoryId, (id) => {
  if (id === null) return;
  const cat = categoryStore.categories.find(c => c.id === id);
  if (cat?.type) {
    selectedCategoryType.value = cat.type;
  }
});

// --- Transactions filtrées ---
const filteredTransactions = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  let txs = transactionStore.transactions.filter(t => {
    const d = new Date(t.transactionDate);
    return d >= start && d <= end;
  });

  if (selectedType.value) {
    if (selectedType.value === 'TRANSFER') {
      txs = txs.filter(t => t.linkedTransactionId !== null);
    } else {
      txs = txs.filter(t => t.type === selectedType.value);
    }
  }

  if (selectedCategoryId.value) {
    txs = txs.filter(t => t.categoryId === selectedCategoryId.value);
  } else if (selectedCategoryType.value) {
    const catIds = categoryStore.categories
      .filter(c => c.type === selectedCategoryType.value)
      .map(c => c.id);
    txs = txs.filter(t => t.categoryId !== null && catIds.includes(t.categoryId));
  }

  if (searchDescription.value.trim()) {
    const search = searchDescription.value.trim().toLowerCase();
    txs = txs.filter(t => t.description?.toLowerCase().includes(search));
  }

  return txs;
});

// --- Pagination ---
const PAGE_SIZE = 20;
const currentPage = ref(1);
const paginationBar = ref<HTMLElement | null>(null);

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

const goToPage = (page: number) => {
  const top = paginationBar.value?.getBoundingClientRect().top ?? 0;
  const scrollBefore = window.scrollY;
  currentPage.value = page;
  nextTick(() => {
    const newTop = paginationBar.value?.getBoundingClientRect().top ?? top;
    window.scrollTo({ top: Math.max(0, scrollBefore + (newTop - top)) });
  });
};

watch(filteredTransactions, () => {
  currentPage.value = 1;
  selectedIds.value = new Set();
});

// --- Chargement ---
const loading = ref(false);

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

// --- Sélection multiple ---
const selectedIds = ref<Set<number>>(new Set());
const selectionActive = computed(() => selectedIds.value.size > 0);

const handleToggleSelect = (id: number) => {
  const next = new Set(selectedIds.value);
  next.has(id) ? next.delete(id) : next.add(id);
  selectedIds.value = next;
};

// --- Edition ---
const editingTransaction = ref<Transaction | null>(null);

const handleEdit = (transaction: Transaction) => {
  editingTransaction.value = transaction;
};

const handleSave = async (dto: TransactionDTO) => {
  if (!editingTransaction.value) return;
  try {
    await transactionStore.updateTransaction(editingTransaction.value.id, dto);
    await accountStore.fetchAccounts();
    editingTransaction.value = null;
  } catch {}
};

// --- Suppression ---
const pendingDeleteId = ref<number | null>(null);

const deleteTransaction = (id: number) => {
  pendingDeleteId.value = id;
};

const doDelete = async () => {
  if (pendingDeleteId.value === null) return;
  try {
    await transactionStore.deleteTransaction(pendingDeleteId.value);
    await accountStore.fetchAccounts();
  } catch {} finally {
    pendingDeleteId.value = null;
  }
};

// --- Bulk category ---
const handleBulkCategory = async (categoryId: number) => {
  try {
    await transactionStore.bulkUpdateCategory([...selectedIds.value], categoryId);
    await accountStore.fetchAccounts();
    selectedIds.value = new Set();
  } catch {}
};

// --- Init ---
onMounted(async () => {
  const accountParam = route.query.account;
  if (accountParam) {
    selectedAccountId.value = Number(accountParam);
  }

  const monthParam = route.query.month;
  if (monthParam) {
    selectedMonth.value = String(monthParam);
  }

  await Promise.all([
    accountStore.fetchAccounts(),
    categoryStore.fetchCategories(),
    loadTransactions()
  ]);

  const categoryParam = route.query.categoryId;
  if (categoryParam) {
    selectedCategoryId.value = Number(categoryParam);
  }
});
</script>

<style scoped>
.transactions-view {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* BudgetMonthSelector a son propre margin-bottom — on le neutralise */
.transactions-view :deep(.month-selector) {
  margin-bottom: 0;
}

/* Pills */
.type-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.pill:hover {
  background: var(--bg-hover);
}

.pill.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #fff;
}

/* Transactions */
.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.transactions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
</style>
