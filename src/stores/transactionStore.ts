import { defineStore } from 'pinia';
import { ref } from 'vue';
import { transactionService } from '@/services/transactionService';
import type { Transaction, TransactionDTO, TransferDTO } from '@/types';

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<Transaction[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Charge toutes les transactions
  const fetchTransactions = async () => {
    loading.value = true;
    error.value = null;
    try {
      transactions.value = await transactionService.getAll();
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des transactions';
      console.error('Erreur fetchTransactions:', e);
    } finally {
      loading.value = false;
    }
  };

  // Charge les transactions d'un compte
  const fetchByAccount = async (accountId: number) => {
    loading.value = true;
    error.value = null;
    try {
      transactions.value = await transactionService.getByAccount(accountId);
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des transactions';
      console.error('Erreur fetchByAccount:', e);
    } finally {
      loading.value = false;
    }
  };

  // Crée une nouvelle transaction
  const createTransaction = async (transactionData: TransactionDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const newTransaction = await transactionService.create(transactionData);
      transactions.value.unshift(newTransaction); // Ajoute au début
      return newTransaction;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la création de la transaction';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Crée un virement
  const createTransfer = async (transferData: TransferDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const newTransactions = await transactionService.createTransfer(transferData);
      transactions.value.unshift(...newTransactions);
      return newTransactions;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la création du virement';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Met à jour une transaction
  const updateTransaction = async (id: number, transactionData: TransactionDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const updated = await transactionService.update(id, transactionData);
      const index = transactions.value.findIndex(t => t.id === id);
      if (index !== -1) {
        transactions.value[index] = updated;
      }
      return updated;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la mise à jour de la transaction';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Met à jour la catégorie de plusieurs transactions en parallèle
  const bulkUpdateCategory = async (ids: number[], categoryId: number) => {
    loading.value = true;
    error.value = null;
    try {
      await Promise.all(
        ids.map(id => {
          const transaction = transactions.value.find(t => t.id === id);
          if (!transaction) return Promise.resolve();
          const dto = {
            accountId: transaction.accountId,
            categoryId,
            amount: transaction.amount,
            type: transaction.type,
            description: transaction.description,
            transactionDate: transaction.transactionDate,
          };
          return transactionService.update(id, dto).then(updated => {
            const index = transactions.value.findIndex(t => t.id === id);
            if (index !== -1) transactions.value[index] = updated;
          });
        })
      );
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la mise à jour en masse';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Supprime une transaction
  const deleteTransaction = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      await transactionService.delete(id);
      transactions.value = transactions.value.filter(t => t.id !== id);
      // Si c'était un virement, la transaction liée est aussi supprimée côté backend
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la suppression de la transaction';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    fetchByAccount,
    createTransaction,
    createTransfer,
    updateTransaction,
    bulkUpdateCategory,
    deleteTransaction
  };
});
