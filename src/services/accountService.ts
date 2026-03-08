import api from './api';
import type { Account, AccountDTO } from '@/types';

export const accountService = {
  // Récupère tous les comptes
  getAll: async (): Promise<Account[]> => {
    const response = await api.get<Account[]>('/accounts');
    return response.data;
  },

  // Récupère un compte par ID
  getById: async (id: number): Promise<Account> => {
    const response = await api.get<Account>(`/accounts/${id}`);
    return response.data;
  },

  // Récupère le solde d'un compte
  getBalance: async (id: number): Promise<number> => {
    const response = await api.get<number>(`/accounts/${id}/balance`);
    return response.data;
  },

  // Récupère le solde total de tous les comptes
  getTotalBalance: async (): Promise<number> => {
    const response = await api.get<number>('/accounts/total-balance');
    return response.data;
  },

  // Crée un nouveau compte
  create: async (account: AccountDTO): Promise<Account> => {
    const response = await api.post<Account>('/accounts', account);
    return response.data;
  },

  // Met à jour un compte
  update: async (id: number, account: AccountDTO): Promise<Account> => {
    const response = await api.put<Account>(`/accounts/${id}`, account);
    return response.data;
  },

  // Supprime un compte
  delete: async (id: number): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  },

  // Réordonne les comptes
  reorder: async (orderedIds: number[]): Promise<void> => {
    await api.put('/accounts/reorder', orderedIds);
  }
};
