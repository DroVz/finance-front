import { defineStore } from 'pinia';
import { ref } from 'vue';
import { accountService } from '@/services/accountService';
import type { Account, AccountDTO } from '@/types';

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<Account[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Charge tous les comptes
  const fetchAccounts = async () => {
    loading.value = true;
    error.value = null;
    try {
      accounts.value = await accountService.getAll();
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des comptes';
      console.error('Erreur fetchAccounts:', e);
    } finally {
      loading.value = false;
    }
  };

  // Crée un nouveau compte
  const createAccount = async (accountData: AccountDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const newAccount = await accountService.create(accountData);
      accounts.value.push(newAccount);
      return newAccount;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la création du compte';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Met à jour un compte
  const updateAccount = async (id: number, accountData: AccountDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const updated = await accountService.update(id, accountData);
      const index = accounts.value.findIndex(a => a.id === id);
      if (index !== -1) {
        accounts.value[index] = updated;
      }
      return updated;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la mise à jour du compte';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Supprime un compte
  const deleteAccount = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      await accountService.delete(id);
      accounts.value = accounts.value.filter(a => a.id !== id);
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la suppression du compte';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Calcule le solde total
  const getTotalBalance = () => {
    return accounts.value.reduce((sum, account) => sum + account.currentBalance, 0);
  };

  // Réordonne les comptes
  const reorderAccounts = async (orderedIds: number[]) => {
    await accountService.reorder(orderedIds);
    await fetchAccounts();
  };

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getTotalBalance,
    reorderAccounts
  };
});
