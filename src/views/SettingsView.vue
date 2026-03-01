<template>
  <div class="settings-view">
    <h2 class="page-title">Gestion des comptes</h2>

    <!-- Formulaire d'ajout de compte -->
    <div class="card">
      <h3 class="section-title">Ajouter un nouveau compte</h3>

      <form @submit.prevent="handleCreateAccount" class="account-form">
        <div class="form-row">
          <IconPicker v-model="newAccount.icon" />
          <input
            v-model="newAccount.name"
            type="text"
            class="form-input"
            placeholder="Nom du compte (ex: Livret A)"
            required
          />
          <button type="submit" class="btn btn-primary" :disabled="accountStore.loading">
            ➕ Ajouter
          </button>
        </div>
      </form>

      <div v-if="accountError" class="error-message">{{ accountError }}</div>
      <div v-if="accountSuccess" class="success-message">{{ accountSuccess }}</div>
    </div>

    <!-- Liste des comptes -->
    <div class="card">
      <h3 class="section-title">Mes comptes ({{ accountStore.accounts.length }})</h3>

      <LoadingSpinner v-if="accountStore.loading && accountStore.accounts.length === 0" />

      <EmptyState
        v-else-if="accountStore.accounts.length === 0"
        message="Aucun compte créé"
      />

      <div v-else class="accounts-list">
        <AccountCard
          v-for="account in accountStore.accounts"
          :key="account.id"
          :account="account"
          @edit="editAccount"
          @delete="confirmDeleteAccount"
        />
      </div>
    </div>

    <!-- Info box -->
    <div class="info-box">
      <div class="info-icon">💡</div>
      <div class="info-content">
        <h4>À propos des comptes</h4>
        <ul>
          <li>Vous pouvez créer autant de comptes que nécessaire (compte courant, épargne, espèces, etc.)</li>
          <li>Le renommage d'un compte mettra automatiquement à jour toutes les transactions associées</li>
          <li>La suppression d'un compte avec des transactions vous demandera une confirmation</li>
          <li>Le solde de chaque compte est calculé automatiquement à partir de vos transactions</li>
        </ul>
      </div>
    </div>

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

    <!-- Modal d'édition de compte -->
    <BaseModal :show="showEditModal" @close="closeEditModal">
      <h3>Modifier le compte</h3>
      <form @submit.prevent="handleUpdateAccount">
        <div class="form-group">
          <label class="form-label">Icône</label>
          <IconPicker v-model="editingAccount.icon" />
        </div>
        <div class="form-group">
          <label class="form-label">Nom du compte</label>
          <input
            v-model="editingAccount.name"
            type="text"
            class="form-input"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">Solde initial</label>
          <input
            v-model.number="editingAccount.initialBalance"
            type="number"
            step="0.01"
            class="form-input"
            required
          />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn" @click="closeEditModal">Annuler</button>
          <button type="submit" class="btn btn-primary">Enregistrer</button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAccountStore } from '@/stores/accountStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { profileService } from '@/services/profileService';
import type { AccountDTO, CategoryDTO, Account } from '@/types';
import LoadingSpinner from '@/components/base/LoadingSpinner.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import AccountCard from '@/components/settings/AccountCard.vue';
import CategoryCard from '@/components/settings/CategoryCard.vue';
import IconPicker from '@/components/base/IconPicker.vue';
import ColorPicker from '@/components/base/ColorPicker.vue';

const accountStore = useAccountStore();
const categoryStore = useCategoryStore();

const visibleCategories = computed(() => categoryStore.categories.filter(c => !c.defaultCategory));

onMounted(async () => {
  await Promise.all([
    accountStore.fetchAccounts(),
    categoryStore.fetchCategories()
  ]);
});


// Gestion des comptes
const newAccount = ref<AccountDTO>({
  name: '',
  initialBalance: 0,
  currency: 'EUR',
  icon: '💳'
});

const accountError = ref<string | null>(null);
const accountSuccess = ref<string | null>(null);

const showEditModal = ref(false);
const editingAccount = ref<AccountDTO & { id?: number }>({
  name: '',
  initialBalance: 0,
  currency: 'EUR',
  icon: '💳'
});

const handleCreateAccount = async () => {
  accountError.value = null;
  accountSuccess.value = null;

  try {
    await accountStore.createAccount(newAccount.value);
    accountSuccess.value = 'Compte créé avec succès !';
    newAccount.value = { name: '', initialBalance: 0, currency: 'EUR', icon: '💳' };

    setTimeout(() => {
      accountSuccess.value = null;
    }, 3000);
  } catch (error: any) {
    accountError.value = error.response?.data?.message || 'Erreur lors de la création du compte';
  }
};

const editAccount = (account: Account) => {
  editingAccount.value = {
    id: account.id,
    name: account.name,
    initialBalance: account.initialBalance,
    currency: account.currency,
    icon: account.icon || '💳'
  };
  showEditModal.value = true;
};

const handleUpdateAccount = async () => {
  if (!editingAccount.value.id) return;

  try {
    await accountStore.updateAccount(editingAccount.value.id, {
      name: editingAccount.value.name,
      initialBalance: editingAccount.value.initialBalance,
      currency: editingAccount.value.currency,
      icon: editingAccount.value.icon
    });
    closeEditModal();
    accountSuccess.value = 'Compte modifié avec succès !';

    setTimeout(() => {
      accountSuccess.value = null;
    }, 3000);
  } catch (error: any) {
    accountError.value = error.response?.data?.message || 'Erreur lors de la modification';
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingAccount.value = { name: '', initialBalance: 0, currency: 'EUR', icon: '💳' };
};

const confirmDeleteAccount = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.')) {
    return;
  }

  try {
    await accountStore.deleteAccount(id);
    accountSuccess.value = 'Compte supprimé avec succès !';

    setTimeout(() => {
      accountSuccess.value = null;
    }, 3000);
  } catch (error: any) {
    accountError.value = error.response?.data?.message || 'Erreur lors de la suppression';
  }
};

// Gestion des catégories
const newCategory = ref<CategoryDTO>({
  name: '',
  parentId: null,
  color: undefined
});

const categoryError = ref<string | null>(null);
const categorySuccess = ref<string | null>(null);

const handleCreateCategory = async () => {
  categoryError.value = null;
  categorySuccess.value = null;

  try {
    await categoryStore.createCategory(newCategory.value);
    categorySuccess.value = 'Catégorie créée avec succès !';
    newCategory.value = { name: '', parentId: null, color: undefined };

    setTimeout(() => {
      categorySuccess.value = null;
    }, 3000);
  } catch (error: any) {
    categoryError.value = error.response?.data?.message || 'Erreur lors de la création de la catégorie';
  }
};

const confirmDeleteCategory = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
    return;
  }

  try {
    await categoryStore.deleteCategory(id);
    categorySuccess.value = 'Catégorie supprimée avec succès !';

    setTimeout(() => {
      categorySuccess.value = null;
    }, 3000);
  } catch (error: any) {
    categoryError.value = error.response?.data?.message || 'Erreur lors de la suppression';
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
}

.settings-view > .card,
.settings-view > .info-box {
  margin-bottom: 20px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

.account-form {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-input {
  flex: 1;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-box {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--bg-info-tint);
  border-radius: var(--radius);
  border-left: 4px solid var(--primary-color);
  margin-top: 24px;
  color: var(--text-info-tint);
}

.info-icon {
  font-size: 32px;
}

.info-content h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.info-content ul {
  list-style: disc;
  padding-left: 20px;
  color: var(--text-secondary);
}

.info-content li {
  margin-bottom: 8px;
  font-size: 14px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.success-message {
  background: var(--bg-success-tint);
  color: var(--text-success-tint);
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
