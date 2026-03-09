<template>
  <div class="add-transaction-view">
    <div class="page-header">
      <h2>Nouvelle transaction</h2>
      <button class="btn btn-success" @click="showImportModal = true">
        📥 Importer CSV
      </button>
    </div>

    <div class="card">
      <!-- Sélection du type -->
      <TypeSelector v-model="selectedType" />

      <!-- Formulaire pour EXPENSE ou INCOME -->
      <TransactionForm
        v-if="selectedType !== TransactionType.TRANSFER"
        v-model="form"
        :categories="selectableCategories"
        :default-category-id="categoryStore.defaultCategory?.id"
        :accounts="accountStore.accounts"
        :loading="loading"
        @submit="handleSubmit"
      />

      <!-- Formulaire pour TRANSFER -->
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

    <!-- Modal d'import CSV -->
    <CsvImportModal
      :show="showImportModal"
      :accounts="accountStore.accounts"
      :categories="categoryStore.categories"
      :objectives="objectiveStore.activeObjectives"
      @close="showImportModal = false"
      @imported="handleImported"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
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

// Formulaire pour EXPENSE/INCOME
const form = ref<TransactionDTO>({
  accountId: null as any,
  categoryId: null as any,
  amount: 0,
  type: TransactionType.EXPENSE,
  description: null,
  transactionDate: new Date().toISOString().split('T')[0]
});

// Pré-sélectionne la catégorie par défaut dès qu'elle est disponible
watch(
  () => categoryStore.defaultCategory,
  (defaultCat) => {
    if (defaultCat && !form.value.categoryId) {
      form.value = { ...form.value, categoryId: defaultCat.id };
    }
  },
  { immediate: true }
);

// Formulaire pour TRANSFER
const transferForm = ref<TransferDTO>({
  sourceAccountId: null as any,
  destinationAccountId: null as any,
  amount: 0,
  description: null,
  transactionDate: new Date().toISOString().split('T')[0]
});

// Gestion de la soumission pour EXPENSE/INCOME
const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  success.value = null;

  try {
    form.value.type = selectedType.value;
    await transactionStore.createTransaction(form.value);
    success.value = 'Transaction créée avec succès !';

    // Reset du formulaire
    form.value = {
      accountId: null as any,
      categoryId: categoryStore.defaultCategory?.id ?? (null as any),
      amount: 0,
      type: selectedType.value,
      description: null,
      transactionDate: new Date().toISOString().split('T')[0]
    };

    // Recharge les comptes pour mettre à jour les soldes
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

// Gestion de la soumission pour TRANSFER
const handleTransferSubmit = async () => {
  loading.value = true;
  error.value = null;
  success.value = null;

  try {
    await transactionStore.createTransfer(transferForm.value);
    success.value = 'Virement effectué avec succès !';

    // Reset du formulaire
    transferForm.value = {
      sourceAccountId: null as any,
      destinationAccountId: null as any,
      amount: 0,
      description: null,
      transactionDate: new Date().toISOString().split('T')[0]
    };

    // Recharge les comptes
    await accountStore.fetchAccounts();

    // Recharger les objectifs si un objectif était associé
    if (transferForm.value.objectiveId) {
      await objectiveStore.fetchObjectives();
    }

    setTimeout(() => {
      success.value = null;
    }, 3000);
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur lors de la création du virement';
  } finally {
    loading.value = false;
  }
};

// Callback après import CSV réussi
const handleImported = async () => {
  await accountStore.fetchAccounts();
};

// Charger les objectifs actifs au montage
onMounted(async () => {
  await objectiveStore.fetchObjectives();
});
</script>

<style scoped>
.add-transaction-view {
  max-width: 600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 28px;
  font-weight: 600;
}

.success-message {
  background: #d1fae5;
  color: #065f46;
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
}
</style>
