import api from './api';
import type { Category, CategoryDTO } from '@/types';

export const categoryService = {
  // Récupère toutes les catégories
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  // Récupère une catégorie par ID
  getById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  // Récupère les catégories racines
  getRootCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories/root');
    return response.data;
  },

  // Récupère les sous-catégories
  getSubCategories: async (parentId: number): Promise<Category[]> => {
    const response = await api.get<Category[]>(`/categories/${parentId}/children`);
    return response.data;
  },

  // Crée une nouvelle catégorie
  create: async (category: CategoryDTO): Promise<Category> => {
    const response = await api.post<Category>('/categories', category);
    return response.data;
  },

  // Met à jour une catégorie
  update: async (id: number, category: CategoryDTO): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, category);
    return response.data;
  },

  // Supprime une catégorie
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  // Initialise les catégories par défaut
  initialize: async (): Promise<void> => {
    await api.post('/categories/initialize');
  }
};
