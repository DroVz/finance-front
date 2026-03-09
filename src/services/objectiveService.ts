import api from './api';
import type { Objective, ObjectiveDTO, ActiveObjectivesCount, FinancialStats } from '@/types';

export const objectiveService = {
  // Crée un nouvel objectif
  create: async (objective: ObjectiveDTO): Promise<Objective> => {
    const response = await api.post<Objective>('/objectives', objective);
    return response.data;
  },

  // Récupère tous les objectifs
  getAll: async (): Promise<Objective[]> => {
    const response = await api.get<Objective[]>('/objectives');
    return response.data;
  },

  // Récupère les objectifs actifs
  getActive: async (): Promise<Objective[]> => {
    const response = await api.get<Objective[]>('/objectives/active');
    return response.data;
  },

  // Récupère les objectifs complétés
  getCompleted: async (): Promise<Objective[]> => {
    const response = await api.get<Objective[]>('/objectives/completed');
    return response.data;
  },

  // Récupère un objectif par ID
  getById: async (id: number): Promise<Objective> => {
    const response = await api.get<Objective>(`/objectives/${id}`);
    return response.data;
  },

  // Compte les objectifs actifs
  countActive: async (): Promise<ActiveObjectivesCount> => {
    const response = await api.get<ActiveObjectivesCount>('/objectives/count-active');
    return response.data;
  },

  // Supprime un objectif
  delete: async (id: number): Promise<void> => {
    await api.delete(`/objectives/${id}`);
  },

  // Récupère les statistiques financières
  getFinancialStats: async (months: number = 3): Promise<FinancialStats> => {
    const response = await api.get<FinancialStats>('/user/financial-stats', { params: { months } });
    return response.data;
  }
};
