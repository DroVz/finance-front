import api from './api';
import type { CashFlowStats, MonthlyCashFlow } from '@/types';

export const cashFlowService = {
  /**
   * Récupère les statistiques de cash flow pour une période
   * @param startDate Date de début (format ISO: YYYY-MM-DD), optionnel
   * @param endDate Date de fin (format ISO: YYYY-MM-DD), optionnel
   * @param accountId ID du compte, optionnel (null = tous comptes)
   * @returns Stats avec revenus, dépenses, cash flow, taux d'épargne et breakdown par catégorie
   */
  getStats: async (
    startDate?: string,
    endDate?: string,
    accountId?: number | null
  ): Promise<CashFlowStats> => {
    const params: any = {};
    if (startDate) params.start = startDate;
    if (endDate) params.end = endDate;
    if (accountId) params.accountId = accountId;

    const response = await api.get<CashFlowStats>('/cash-flow/stats', { params });
    return response.data;
  },

  /**
   * Récupère le cash flow mensuel pour les X derniers mois
   * @param months Nombre de mois (défaut: 12)
   * @param accountId ID du compte, optionnel (null = tous comptes)
   * @returns Liste des points mensuels pour le graphique
   */
  getMonthlyCashFlow: async (
    months: number = 12,
    accountId?: number | null
  ): Promise<MonthlyCashFlow[]> => {
    const params: any = { months };
    if (accountId) params.accountId = accountId;

    const response = await api.get<MonthlyCashFlow[]>('/cash-flow/monthly', { params });
    return response.data;
  }
};
