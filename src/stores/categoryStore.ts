import { defineStore } from 'pinia';
import { ref } from 'vue';
import { categoryService } from '@/services/categoryService';
import type { Category, CategoryDTO } from '@/types';

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Charge toutes les catégories
  const fetchCategories = async () => {
    loading.value = true;
    error.value = null;
    try {
      categories.value = await categoryService.getAll();
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors du chargement des catégories';
      console.error('Erreur fetchCategories:', e);
    } finally {
      loading.value = false;
    }
  };

  // Crée une nouvelle catégorie
  const createCategory = async (categoryData: CategoryDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const newCategory = await categoryService.create(categoryData);
      categories.value.push(newCategory);
      return newCategory;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la création de la catégorie';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Met à jour une catégorie
  const updateCategory = async (id: number, categoryData: CategoryDTO) => {
    loading.value = true;
    error.value = null;
    try {
      const updated = await categoryService.update(id, categoryData);
      const index = categories.value.findIndex(c => c.id === id);
      if (index !== -1) {
        categories.value[index] = updated;
      }
      return updated;
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la mise à jour de la catégorie';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Supprime une catégorie
  const deleteCategory = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      await categoryService.delete(id);
      categories.value = categories.value.filter(c => c.id !== id);
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Erreur lors de la suppression de la catégorie';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
});
