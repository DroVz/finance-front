<template>
  <div v-if="show" class="modal-overlay" @click="emit('close')">
    <div class="modal-body" @click.stop>
      <div class="modal-header">
        <h2>Nouvelle transaction</h2>
        <div class="modal-header-actions">
          <button class="btn btn-success btn-sm" @click="showImportModal = true">
            📥 Importer CSV
          </button>
          <button class="close-btn" @click="emit('close')" title="Fermer">✕</button>
        </div>
      </div>

      <!-- Sélection du type -->
      <TypeSelector v-model="selectedType" />

      <!-- Formulaire EXPENSE / INCOME -->
      <TransactionForm
        v-if="selectedType !== TransactionType.TRANSFER"
        v-model="form"
        :categories="selectableCategories"
        :default-category-id="categoryStore.defaultCategory?.id"
        :accounts="accountStore.accounts"
        :loading="loading"
        @submit="handleSubmit"
      />

      <!-- Formulaire TRANSFER -->
      <TransferForm
        v-else
        v-model="transferForm"
        :accounts="accountStore.accounts"
        :active-objectives="objectiveStore.activeObjectives"
        :loading="loading"
        @submit="handleTransferSubmit"
      />

      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="success" class="success-message">{{ success }}</div>
    </div>
  </div>

  <!-- Modal d'import CSV (hors overlay principal) -->
  <CsvImportModal
    :show="showImportModal"
    :accounts="accountStore.accounts"
    :categories="categoryStore.categories"
    @close="showImportModal = false"
    @imported="handleImported"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAccountStore } from '@/stores/accountStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useObjectiveStore } from '@/stores/objectiveStore';
import { TransactionType } from '@/types';
import type { TransactionDTO, TransferDTO } from '@/types';
import TypeSelector from '@/components/transaction/TypeSelector.vue';
import TransactionForm from '@/components/transaction/TransactionForm.vue';
import TransferForm from '@/components/transaction/TransferForm.vue';
import CsvImportModal from '@/components/import/CsvImportModal.vue';

defineProps<{ show: boolean }>();
const emit = defineEmits<{ close: [] }>();

const accountStore = useAccountStore();
const categoryStore = useCategoryStore();
const transactionStore = useTransactionStore();
const objectiveStore = useObjectiveStore();

const selectableCategories = computed(() => categoryStore.categories.filter(c => !c.defaultCategory));

const selectedType = ref<TransactionType>(TransactionType.EXPENSE);
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const showImportModal = ref(false);

const form = ref<TransactionDTO>({
  accountId: null as any,
  categoryId: null as any,
  amount: 0,
  type: TransactionType.EXPENSE,
  description: null,
  transactionDate: new Date().toISOString().split('T')[0]
});

watch(
  () => categoryStore.defaultCategory,
  (defaultCat) => {
    if (defaultCat && !form.value.categoryId) {
      form.value = { ...form.value, categoryId: defaultCat.id };
    }
  },
  { immediate: true }
);

const transferForm = ref<TransferDTO>({
  sourceAccountId: null as any,
  destinationAccountId: null as any,
  amount: 0,
  description: null,
  transactionDate: new Date().toISOString().split('T')[0]
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  success.value = null;

  try {
    form.value.type = selectedType.value;
    await transactionStore.createTransaction(form.value);
    success.value = 'Transaction créée avec succès !';

    form.value = {
      accountId: null as any,
      categoryId: categoryStore.defaultCategory?.id ?? (null as any),
      amount: 0,
      type: selectedType.value,
      description: null,
      transactionDate: new Date().toISOString().split('T')[0]
    };

    await accountStore.fetchAccounts();

    setTimeout(() => {
      success.value = null;
    }, 3000);
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur lors de la création de la transaction';
  } finally {
    loading.value = false;
  }
};

const handleTransferSubmit = async () => {
  loading.value = true;
  error.value = null;
  success.value = null;

  try {
    await transactionStore.createTransfer(transferForm.value);
    success.value = 'Virement effectué avec succès !';

    const hadObjective = !!transferForm.value.objectiveId;

    transferForm.value = {
      sourceAccountId: null as any,
      destinationAccountId: null as any,
      amount: 0,
      description: null,
      transactionDate: new Date().toISOString().split('T')[0]
    };

    await accountStore.fetchAccounts();
    if (hadObjective) await objectiveStore.fetchObjectives();

    setTimeout(() => {
      success.value = null;
    }, 3000);
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur lors de la création du virement';
  } finally {
    loading.value = false;
  }
};

const handleImported = async () => {
  await accountStore.fetchAccounts();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 16px;
}

.modal-body {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 32px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 12px;
}

.modal-header h2 {
  font-size: 22px;
  font-weight: 600;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-sm {
  font-size: 13px;
  padding: 6px 12px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 6px;
  line-height: 1;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.error-message {
  background: var(--bg-danger-tint, #fee2e2);
  color: var(--danger-color, #dc2626);
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
}

.success-message {
  background: var(--bg-success-tint, #d1fae5);
  color: var(--text-success-tint, #065f46);
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
}
</style>
