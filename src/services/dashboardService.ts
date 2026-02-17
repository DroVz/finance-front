import api from './api';
import type { DashboardStats } from '@/types';

export const dashboardService = {
  // Récupère les stats pour une période donnée
  getStats: async (startDate?: string, endDate?: string): Promise<DashboardStats> => {
    const params: any = {};
    if (startDate) params.start = startDate;
    if (endDate) params.end = endDate;
    
    const response = await api.get<DashboardStats>('/dashboard/stats', { params });
    return response.data;
  },

  // Récupère les stats du mois en cours
  getCurrentMonthStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats/current-month');
    return response.data;
  },

  // Récupère les stats de l'année en cours
  getCurrentYearStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats/current-year');
    return response.data;
  }
};
