<template>
  <div class="accounts-view">
    <!-- KPI Cards -->
    <div class="kpi-cards">
      <MetricCard
        icon="💰"
        label="Solde total"
        :value="formatCurrency(totalBalance)"
        variant="primary"
      />
      <MetricCard
        icon="📈"
        label="Revenus ce mois"
        :value="formatCurrency(stats?.totalIncome || 0)"
        variant="success"
      />
      <MetricCard
        icon="📉"
        label="Dépenses ce mois"
        :value="formatCurrency(stats?.totalExpenses || 0)"
        variant="danger"
      />
    </div>

    <!-- Formulaire d'ajout de compte -->
    <div class="card">
      <h3 class="section-title">Ajouter un compte</h3>
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
          <input
            v-model.number="newAccount.initialBalance"
            type="number"
            step="0.01"
            class="form-input form-input-balance"
            placeholder="Solde initial"
          />
          <button type="submit" class="btn btn-primary" :disabled="accountStore.loading">
            ➕ Ajouter
          </button>
        </div>
      </form>
      <div v-if="accountError" class="error-message">{{ accountError }}</div>
      <div v-if="accountSuccess" class="success-message">{{ accountSuccess }}</div>
    </div>

    <!-- Liste des comptes (drag & drop, edit, delete) -->
    <div class="card">
      <h3 class="section-title">Mes comptes ({{ accountStore.accounts.length }})</h3>

      <LoadingSpinner v-if="accountStore.loading && accountStore.accounts.length === 0" />
      <EmptyState v-else-if="accountStore.accounts.length === 0" message="Aucun compte créé" />

      <div v-else class="drag-list">
        <AccountCard
          v-for="(account, index) in accountStore.accounts"
          :key="account.id"
          :account="account"
          draggable="true"
          :class="{ 'drag-over': dragOverIndex === index, 'dragging': dragIndex === index }"
          @edit="editAccount"
          @delete="confirmDeleteAccount"
          @dragstart="onDragStart(index, $event)"
          @dragover.prevent="onDragOver(index)"
          @drop.prevent="onDrop(index)"
          @dragend="onDragEnd"
        />
      </div>
    </div>

    <!-- Modal édition compte -->
    <BaseModal :show="showEditModal" @close="closeEditModal">
      <h3>Modifier le compte</h3>
      <form @submit.prevent="handleUpdateAccount">
        <div class="form-group">
          <label class="form-label">Icône</label>
          <IconPicker v-model="editingAccount.icon" />
        </div>
        <div class="form-group">
          <label class="form-label">Nom du compte</label>
          <input v-model="editingAccount.name" type="text" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Solde initial</label>
          <input v-model.number="editingAccount.initialBalance" type="number" step="0.01" class="form-input" required />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn" @click="closeEditModal">Annuler</button>
          <button type="submit" class="btn btn-primary">Enregistrer</button>
        </div>
      </form>
    </BaseModal>

    <ConfirmModal
      :show="pendingDeleteAccountId !== null"
      title="Supprimer ce compte ?"
      message="Cette action est irréversible. Toutes les transactions associées seront également supprimées."
      @confirm="doDeleteAccount"
      @cancel="pendingDeleteAccountId = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAccountStore } from '@/stores/accountStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { dashboardService } from '@/services/dashboardService';
import { useFormatters } from '@/composables/useFormatters';
import type { AccountDTO, DashboardStats, Account } from '@/types';
import LoadingSpinner from '@/components/base/LoadingSpinner.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import ConfirmModal from '@/components/base/ConfirmModal.vue';
import MetricCard from '@/components/cashflow/MetricCard.vue';
import AccountCard from '@/components/settings/AccountCard.vue';
import IconPicker from '@/components/base/IconPicker.vue';

const { formatCurrency } = useFormatters();

const accountStore = useAccountStore();
const categoryStore = useCategoryStore();

const stats = ref<DashboardStats | null>(null);
const totalBalance = computed(() => accountStore.getTotalBalance());

// --- Drag & drop ---
const dragIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

const onDragStart = (index: number, event: DragEvent) => {
  dragIndex.value = index;
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
};

const onDragOver = (index: number) => {
  if (dragIndex.value !== null && dragIndex.value !== index) {
    dragOverIndex.value = index;
  }
};

const onDrop = async (targetIndex: number) => {
  if (dragIndex.value === null || dragIndex.value === targetIndex) return;
  const accounts = [...accountStore.accounts];
  const [moved] = accounts.splice(dragIndex.value, 1);
  accounts.splice(targetIndex, 0, moved);
  accountStore.accounts = accounts;
  dragIndex.value = null;
  dragOverIndex.value = null;
  await accountStore.reorderAccounts(accounts.map(a => a.id));
};

const onDragEnd = () => {
  dragIndex.value = null;
  dragOverIndex.value = null;
};

// --- Création compte ---
const newAccount = ref<AccountDTO>({ name: '', initialBalance: 0, currency: 'EUR', icon: '💳' });
const accountError = ref<string | null>(null);
const accountSuccess = ref<string | null>(null);

const handleCreateAccount = async () => {
  accountError.value = null;
  accountSuccess.value = null;
  try {
    await accountStore.createAccount(newAccount.value);
    accountSuccess.value = 'Compte créé avec succès !';
    newAccount.value = { name: '', initialBalance: 0, currency: 'EUR', icon: '💳' };
    setTimeout(() => { accountSuccess.value = null; }, 3000);
  } catch (error: any) {
    accountError.value = error.response?.data?.message || 'Erreur lors de la création du compte';
  }
};

// --- Edition compte ---
const showEditModal = ref(false);
const editingAccount = ref<AccountDTO & { id?: number }>({ name: '', initialBalance: 0, currency: 'EUR', icon: '💳' });

const editAccount = (account: Account) => {
  editingAccount.value = { id: account.id, name: account.name, initialBalance: account.initialBalance, currency: account.currency, icon: account.icon || '💳' };
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
    setTimeout(() => { accountSuccess.value = null; }, 3000);
  } catch (error: any) {
    accountError.value = error.response?.data?.message || 'Erreur lors de la modification';
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingAccount.value = { name: '', initialBalance: 0, currency: 'EUR', icon: '💳' };
};

// --- Suppression compte ---
const pendingDeleteAccountId = ref<number | null>(null);

const confirmDeleteAccount = (id: number) => { pendingDeleteAccountId.value = id; };

const doDeleteAccount = async () => {
  if (pendingDeleteAccountId.value === null) return;
  try {
    await accountStore.deleteAccount(pendingDeleteAccountId.value);
  } catch (error: any) {
    accountError.value = error.response?.data?.message || 'Erreur lors de la suppression';
  } finally {
    pendingDeleteAccountId.value = null;
  }
};

// --- Init ---
onMounted(async () => {
  await Promise.all([
    accountStore.fetchAccounts(),
    categoryStore.fetchCategories()
  ]);
  try {
    stats.value = await dashboardService.getCurrentMonthStats();
  } catch {}
});
</script>

<style scoped>
.accounts-view {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.kpi-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
  align-items: center;
}

.form-row .form-input {
  flex: 1;
}

.form-input-balance {
  max-width: 160px;
  flex: 0 0 auto !important;
}

.drag-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drag-list :deep(.dragging) {
  opacity: 0.4;
}

.drag-list :deep(.drag-over) {
  outline: 2px solid var(--primary-color);
  outline-offset: -2px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.error-message {
  background: var(--bg-danger-tint, #fee2e2);
  color: var(--danger-color, #dc2626);
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
}

.success-message {
  background: var(--bg-success-tint, #d1fae5);
  color: var(--text-success-tint, #065f46);
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-input-balance {
    max-width: 100%;
    flex: 1 !important;
  }
}
</style>
