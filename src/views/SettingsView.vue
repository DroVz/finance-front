<template>
  <div class="settings-view">
    <!-- Section Catégories -->
    <div class="card">
      <h3 class="section-title">Gestion des catégories</h3>

      <form @submit.prevent="handleCreateCategory" class="account-form">
        <div class="form-row">
          <ColorPicker v-model="newCategory.color" />
          <input
            v-model="newCategory.name"
            type="text"
            class="form-input"
            placeholder="Nom de la catégorie (ex: Restaurant)"
            required
          />
          <select v-model="newCategory.type" class="form-input" required>
            <option value="" disabled>— Type de catégorie —</option>
            <option value="CHARGES">Charges</option>
            <option value="LOISIRS">Loisirs & quotidien</option>
            <option value="REVENUS">Revenus</option>
          </select>
          <button type="submit" class="btn btn-primary" :disabled="categoryStore.loading">
            ➕ Ajouter
          </button>
        </div>
      </form>

      <div v-if="categoryError" class="error-message">{{ categoryError }}</div>
      <div v-if="categorySuccess" class="success-message">{{ categorySuccess }}</div>
    </div>

    <!-- Liste des catégories -->
    <div class="card">
      <h3 class="section-title">Mes catégories ({{ visibleCategories.length }})</h3>

      <LoadingSpinner v-if="categoryStore.loading && visibleCategories.length === 0" />

      <EmptyState
        v-else-if="visibleCategories.length === 0"
        message="Aucune catégorie créée"
      />

      <div v-else class="categories-grid">
        <CategoryCard
          v-for="category in visibleCategories"
          :key="category.id"
          :category="category"
          @delete="confirmDeleteCategory"
        />
      </div>
    </div>

    <!-- Section changement de mot de passe -->
    <div class="card">
      <h3 class="section-title">Changer mon mot de passe</h3>
      <form @submit.prevent="handleChangePassword" class="account-form">
        <div class="form-group">
          <label class="form-label">Mot de passe actuel</label>
          <input
            v-model="passwordForm.currentPassword"
            type="password"
            class="form-input"
            required
            autocomplete="current-password"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Nouveau mot de passe</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            class="form-input"
            required
            minlength="8"
            autocomplete="new-password"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Confirmer le nouveau mot de passe</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            class="form-input"
            required
            autocomplete="new-password"
          />
        </div>
        <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
        <div v-if="passwordSuccess" class="success-message">{{ passwordSuccess }}</div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="passwordLoading">
            {{ passwordLoading ? 'Enregistrement...' : 'Changer le mot de passe' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal de confirmation suppression catégorie -->
    <ConfirmModal
      :show="pendingDeleteCategoryId !== null"
      title="Supprimer cette catégorie ?"
      message="Les transactions associées à cette catégorie seront réaffectées à « Non attribué »."
      @confirm="doDeleteCategory"
      @cancel="pendingDeleteCategoryId = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCategoryStore } from '@/stores/categoryStore';
import { profileService } from '@/services/profileService';
import type { CategoryDTO, CategoryType } from '@/types';
import LoadingSpinner from '@/components/base/LoadingSpinner.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import ConfirmModal from '@/components/base/ConfirmModal.vue';
import CategoryCard from '@/components/settings/CategoryCard.vue';
import ColorPicker from '@/components/base/ColorPicker.vue';

const categoryStore = useCategoryStore();

const visibleCategories = computed(() => categoryStore.categories.filter(c => !c.defaultCategory));

onMounted(async () => {
  await categoryStore.fetchCategories();
});

// Gestion des catégories
const newCategory = ref<CategoryDTO & { type: CategoryType | '' }>({
  name: '',
  parentId: null,
  color: undefined,
  type: ''
});

const categoryError = ref<string | null>(null);
const categorySuccess = ref<string | null>(null);

const handleCreateCategory = async () => {
  categoryError.value = null;
  categorySuccess.value = null;

  try {
    await categoryStore.createCategory(newCategory.value);
    categorySuccess.value = 'Catégorie créée avec succès !';
    newCategory.value = { name: '', parentId: null, color: undefined, type: '' };

    setTimeout(() => {
      categorySuccess.value = null;
    }, 3000);
  } catch (error: any) {
    categoryError.value = error.response?.data?.message || 'Erreur lors de la création de la catégorie';
  }
};

const pendingDeleteCategoryId = ref<number | null>(null);

const confirmDeleteCategory = (id: number) => {
  pendingDeleteCategoryId.value = id;
};

const doDeleteCategory = async () => {
  if (pendingDeleteCategoryId.value === null) return;
  try {
    await categoryStore.deleteCategory(pendingDeleteCategoryId.value);
  } catch (error: any) {
    categoryError.value = error.response?.data?.message || 'Erreur lors de la suppression';
  } finally {
    pendingDeleteCategoryId.value = null;
  }
};

// Changement de mot de passe
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' });
const passwordError = ref<string | null>(null);
const passwordSuccess = ref<string | null>(null);
const passwordLoading = ref(false);

const handleChangePassword = async () => {
  passwordError.value = null;
  passwordSuccess.value = null;

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Les mots de passe ne correspondent pas';
    return;
  }

  passwordLoading.value = true;
  try {
    await profileService.changePassword(passwordForm.value.currentPassword, passwordForm.value.newPassword);
    passwordSuccess.value = 'Mot de passe modifié avec succès !';
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };

    setTimeout(() => {
      passwordSuccess.value = null;
    }, 3000);
  } catch (error: any) {
    passwordError.value = error.response?.data?.message || 'Erreur lors du changement de mot de passe';
  } finally {
    passwordLoading.value = false;
  }
};
</script>

<style scoped>
.settings-view {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

.account-form {
  margin-bottom: 8px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-input {
  flex: 1;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.success-message {
  background: var(--bg-success-tint);
  color: var(--text-success-tint);
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
}

.error-message {
  background: var(--bg-danger-tint, #fee2e2);
  color: var(--danger-color, #dc2626);
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
}
</style>
