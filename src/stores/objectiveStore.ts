import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { objectiveService } from '@/services/objectiveService';
import type { Objective, ObjectiveDTO, ActiveObjectivesCount, FinancialStats } from '@/types';

export const useObjectiveStore = defineStore('objective', () => {
  const objectives = ref<Objective[]>([]);
  const activeCount = ref<ActiveObjectivesCount | null>(null);
  const financialStats = ref<FinancialStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Charge tous les objectifs
  const fetchObjectives = async () => {
    loading.value = true;
    error.value = null;
    try {
      objectives.value = await objectiveService.getAll();
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des objectifs';
      console.error('Erreur fetchObjectives:', e);
    } finally {
      loading.value = false;
    }
  };

  // Charge les objectifs actifs
  const fetchActiveObjectives = async () => {
    loading.value = true;
    error.value = null;
    try {
      objectives.value = await objectiveService.getActive();
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des objectifs actifs';
      console.error('Erreur fetchActiveObjectives:', e);
    } finally {
      loading.value = false;
    }
  };

  // Compte les objectifs actifs
  const fetchActiveCount = async () => {
    try {
      activeCount.value = await objectiveService.countActive();
    } catch (e: any) {
      console.error('Erreur fetchActiveCount:', e);
    }
  };

  // Charge les statistiques financières
  const fetchFinancialStats = async () => {
    try {
      financialStats.value = await objectiveService.getFinancialStats(3);
    } catch (e: any) {
      console.error('Erreur fetchFinancialStats:', e);
    }
  };

  // Crée un nouvel objectif
  const createObjective = async (objectiveData: ObjectiveDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const newObjective = await objectiveService.create(objectiveData);
      objectives.value.unshift(newObjective);
      await fetchActiveCount(); // Met à jour le compteur
      return newObjective;
    } catch (e: any) {
      error.value = e.response?.data?.message || "Erreur lors de la création de l'objectif";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Supprime un objectif
  const deleteObjective = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      await objectiveService.delete(id);
      objectives.value = objectives.value.filter(o => o.id !== id);
      await fetchActiveCount(); // Met à jour le compteur
    } catch (e: any) {
      error.value = e.response?.data?.message || "Erreur lors de la suppression de l'objectif";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Getters
  const activeObjectives = computed(() =>
    objectives.value.filter(o => o.status === 'ACTIVE')
  );

  const completedObjectives = computed(() =>
    objectives.value.filter(o => o.status === 'COMPLETED')
  );

  return {
    objectives,
    activeCount,
    financialStats,
    loading,
    error,
    fetchObjectives,
    fetchActiveObjectives,
    fetchActiveCount,
    fetchFinancialStats,
    createObjective,
    deleteObjective,
    activeObjectives,
    completedObjectives
  };
});
