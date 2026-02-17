import api from './api';
import type { BudgetRule, BudgetRuleDTO } from '@/types';

export const budgetService = {
  getAll: async (): Promise<BudgetRule[]> => {
    const response = await api.get<BudgetRule[]>('/budget-rules');
    return response.data;
  },

  getMonthlyIncome: async (): Promise<number> => {
    const response = await api.get<number>('/budget-rules/monthly-income');
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
