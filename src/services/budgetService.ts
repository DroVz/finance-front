import api from './api';
import type { BudgetRule, BudgetRuleDTO, BudgetStreak } from '@/types';

export const budgetService = {
  getAll: async (month?: string): Promise<BudgetRule[]> => {
    const params = month ? { month } : {};
    const response = await api.get<BudgetRule[]>('/budget-rules', { params });
    return response.data;
  },

  getMonthlyIncome: async (month?: string): Promise<number> => {
    const params = month ? { month } : {};
    const response = await api.get<number>('/budget-rules/monthly-income', { params });
    return response.data;
  },

  getStreak: async (): Promise<BudgetStreak> => {
    const response = await api.get<BudgetStreak>('/budget-rules/streak');
    return response.data;
  },

  create: async (dto: BudgetRuleDTO): Promise<BudgetRule> => {
    const response = await api.post<BudgetRule>('/budget-rules', dto);
    return response.data;
  },

  update: async (id: number, dto: BudgetRuleDTO): Promise<BudgetRule> => {
    const response = await api.put<BudgetRule>(`/budget-rules/${id}`, dto);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/budget-rules/${id}`);
  }
};
