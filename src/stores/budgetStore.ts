import { defineStore } from 'pinia';
import { ref } from 'vue';
import { budgetService } from '@/services/budgetService';
import type { BudgetRule, BudgetRuleDTO } from '@/types';

export const useBudgetStore = defineStore('budget', () => {
  const rules = ref<BudgetRule[]>([]);
  const monthlyIncome = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchRules = async () => {
    loading.value = true;
    error.value = null;
    try {
      rules.value = await budgetService.getAll();
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des règles';
    } finally {
      loading.value = false;
    }
  };

  const fetchMonthlyIncome = async () => {
    try {
      monthlyIncome.value = await budgetService.getMonthlyIncome();
    } catch (e: any) {
      console.error('Erreur fetchMonthlyIncome:', e);
    }
  };

  const createRule = async (dto: BudgetRuleDTO) => {
    await budgetService.create(dto);
    await fetchRules();
  };

  const updateRule = async (id: number, dto: BudgetRuleDTO) => {
    await budgetService.update(id, dto);
    await fetchRules();
  };

  const deleteRule = async (id: number) => {
    await budgetService.delete(id);
    await fetchRules();
  };

  return {
    rules,
    monthlyIncome,
    loading,
    error,
    fetchRules,
    fetchMonthlyIncome,
    createRule,
    updateRule,
    deleteRule
  };
});
