import { defineStore } from 'pinia';
import { ref } from 'vue';
import { budgetService } from '@/services/budgetService';
import type { BudgetRule, BudgetRuleDTO, BudgetStreak } from '@/types';

const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const useBudgetStore = defineStore('budget', () => {
  const rules = ref<BudgetRule[]>([]);
  const monthlyIncome = ref(0);
  const streak = ref<BudgetStreak | null>(null);
  const selectedMonth = ref<string>(getCurrentMonth());
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchRules = async () => {
    loading.value = true;
    error.value = null;
    try {
      rules.value = await budgetService.getAll(selectedMonth.value);
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des règles';
    } finally {
      loading.value = false;
    }
  };

  const fetchMonthlyIncome = async () => {
    try {
      monthlyIncome.value = await budgetService.getMonthlyIncome(selectedMonth.value);
    } catch (e: any) {
      console.error('Erreur fetchMonthlyIncome:', e);
    }
  };

  const fetchStreak = async () => {
    try {
      streak.value = await budgetService.getStreak();
    } catch (e: any) {
      console.error('Erreur fetchStreak:', e);
    }
  };

  const setSelectedMonth = async (month: string) => {
    selectedMonth.value = month;
    await Promise.all([fetchRules(), fetchMonthlyIncome()]);
  };

  const createRule = async (dto: BudgetRuleDTO) => {
    await budgetService.create(dto);
    await Promise.all([fetchRules(), fetchStreak()]);
  };

  const updateRule = async (id: number, dto: BudgetRuleDTO) => {
    await budgetService.update(id, dto);
    await Promise.all([fetchRules(), fetchStreak()]);
  };

  const deleteRule = async (id: number) => {
    await budgetService.delete(id);
    await Promise.all([fetchRules(), fetchStreak()]);
  };

  return {
    rules,
    monthlyIncome,
    streak,
    selectedMonth,
    loading,
    error,
    fetchRules,
    fetchMonthlyIncome,
    fetchStreak,
    setSelectedMonth,
    createRule,
    updateRule,
    deleteRule
  };
});
