import { defineStore } from 'pinia';
import { ref } from 'vue';
import { cashFlowService } from '@/services/cashFlowService';
import type { CashFlowStats, MonthlyCashFlow } from '@/types';

export const useCashFlowStore = defineStore('cashFlow', () => {
  const stats = ref<CashFlowStats | null>(null);
  const monthlyData = ref<MonthlyCashFlow[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Charge les statistiques de cash flow pour une période
   * @param startDate Date de début (format ISO: YYYY-MM-DD)
   * @param endDate Date de fin (format ISO: YYYY-MM-DD)
   * @param accountId ID du compte (optionnel)
   */
  const fetchStats = async (
    startDate?: string,
    endDate?: string,
    accountId?: number | null
  ) => {
    loading.value = true;
    error.value = null;
    try {
      stats.value = await cashFlowService.getStats(startDate, endDate, accountId);
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des statistiques';
      console.error('Erreur fetchStats:', e);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Charge le cash flow mensuel pour les X derniers mois
   * @param months Nombre de mois (défaut: 12)
   * @param accountId ID du compte (optionnel)
   */
  const fetchMonthly = async (months: number = 12, accountId?: number | null) => {
    loading.value = true;
    error.value = null;
    try {
      monthlyData.value = await cashFlowService.getMonthlyCashFlow(months, accountId);
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des données mensuelles';
      console.error('Erreur fetchMonthly:', e);
    } finally {
      loading.value = false;
    }
  };

  return {
    stats,
    monthlyData,
    loading,
    error,
    fetchStats,
    fetchMonthly
  };
});
