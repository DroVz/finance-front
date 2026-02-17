import api from './api';
import type { Transaction, TransactionDTO, TransferDTO, TransactionType } from '@/types';

export const transactionService = {
  // Récupère toutes les transactions
  getAll: async (): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('/transactions');
    return response.data;
  },

  // Récupère une transaction par ID
  getById: async (id: number): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  // Récupère les transactions d'un compte
  getByAccount: async (accountId: number): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>(`/transactions/account/${accountId}`);
    return response.data;
  },

  // Récupère les transactions d'une catégorie
  getByCategory: async (categoryId: number): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>(`/transactions/category/${categoryId}`);
    return response.data;
  },

  // Récupère les transactions par type
  getByType: async (type: TransactionType): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>(`/transactions/type/${type}`);
    return response.data;
  },

  // Récupère les transactions par période
  getByDateRange: async (startDate: string, endDate: string): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('/transactions/date-range', {
      params: { start: startDate, end: endDate }
    });
    return response.data;
  },

  // Crée une nouvelle transaction
  create: async (transaction: TransactionDTO): Promise<Transaction> => {
    const response = await api.post<Transaction>('/transactions', transaction);
    return response.data;
  },

  // Crée un virement entre comptes
  createTransfer: async (transfer: TransferDTO): Promise<Transaction[]> => {
    const response = await api.post<Transaction[]>('/transactions/transfer', transfer);
    return response.data;
  },

  // Met à jour une transaction
  update: async (id: number, transaction: TransactionDTO): Promise<Transaction> => {
    const response = await api.put<Transaction>(`/transactions/${id}`, transaction);
    return response.data;
  },

  // Supprime une transaction
  delete: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  }
};
