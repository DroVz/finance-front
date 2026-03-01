<template>
  <div class="admin-view">
    <h2 class="page-title">Administration des utilisateurs</h2>

    <!-- Formulaire de création -->
    <div class="card">
      <h3 class="section-title">Créer un utilisateur</h3>

      <form @submit.prevent="handleCreateUser" class="create-form">
        <div class="form-row">
          <input
            v-model="newUser.username"
            type="text"
            class="form-input"
            placeholder="Nom d'utilisateur"
            required
            autocomplete="off"
          />
          <input
            v-model="newUser.password"
            type="password"
            class="form-input"
            placeholder="Mot de passe (min. 8 caractères)"
            required
            minlength="8"
            autocomplete="new-password"
          />
          <select v-model="newUser.role" class="form-input form-select">
            <option value="ROLE_USER">Utilisateur</option>
            <option value="ROLE_ADMIN">Administrateur</option>
          </select>
          <button type="submit" class="btn btn-primary" :disabled="creating">
            {{ creating ? 'Création...' : '➕ Créer' }}
          </button>
        </div>
      </form>

      <div v-if="createError" class="error-message">{{ createError }}</div>
      <div v-if="createSuccess" class="success-message">{{ createSuccess }}</div>
    </div>

    <!-- Liste des utilisateurs -->
    <div class="card">
      <h3 class="section-title">Utilisateurs ({{ users.length }})</h3>

      <LoadingSpinner v-if="loading" />

      <EmptyState v-else-if="users.length === 0" message="Aucun utilisateur" />

      <div v-else class="users-table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>Nom d'utilisateur</th>
              <th>Rôle</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" :class="{ 'current-user-row': user.username === authStore.username }">
              <td class="username-cell">
                {{ user.username }}
                <span v-if="user.username === authStore.username" class="self-badge">Vous</span>
              </td>
              <td>
                <span class="role-badge" :class="user.role === 'ROLE_ADMIN' ? 'role-admin' : 'role-user'">
                  {{ user.role === 'ROLE_ADMIN' ? 'Admin' : 'Utilisateur' }}
                </span>
              </td>
              <td class="date-cell">{{ formatDate(user.createdAt) }}</td>
              <td>
                <button
                  class="btn btn-danger btn-sm"
                  :disabled="user.username === authStore.username"
                  :title="user.username === authStore.username ? 'Vous ne pouvez pas supprimer votre propre compte' : 'Supprimer'"
                  @click="handleDeleteUser(user)"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="deleteError" class="error-message">{{ deleteError }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminService, type AppUserDTO } from '@/services/adminService';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/base/LoadingSpinner.vue';
import EmptyState from '@/components/base/EmptyState.vue';

const authStore = useAuthStore();

const users = ref<AppUserDTO[]>([]);
const loading = ref(false);
const creating = ref(false);

const createError = ref<string | null>(null);
const createSuccess = ref<string | null>(null);
const deleteError = ref<string | null>(null);

const newUser = ref({ username: '', password: '', role: 'ROLE_USER' });

const loadUsers = async () => {
  loading.value = true;
  try {
    users.value = await adminService.getUsers();
  } catch (error: any) {
    deleteError.value = error.response?.data?.message || 'Erreur lors du chargement des utilisateurs';
  } finally {
    loading.value = false;
  }
};

const handleCreateUser = async () => {
  createError.value = null;
  createSuccess.value = null;
  creating.value = true;

  try {
    await adminService.createUser(newUser.value);
    createSuccess.value = `Utilisateur "${newUser.value.username}" créé avec succès !`;
    newUser.value = { username: '', password: '', role: 'ROLE_USER' };
    await loadUsers();

    setTimeout(() => {
      createSuccess.value = null;
    }, 3000);
  } catch (error: any) {
    createError.value = error.response?.data?.message || 'Erreur lors de la création';
  } finally {
    creating.value = false;
  }
};

const handleDeleteUser = async (user: AppUserDTO) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.username}" ? Toutes ses données seront perdues.`)) {
    return;
  }

  deleteError.value = null;
  try {
    await adminService.deleteUser(user.id);
    await loadUsers();
  } catch (error: any) {
    deleteError.value = error.response?.data?.message || 'Erreur lors de la suppression';
  }
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

onMounted(loadUsers);
</script>

<style scoped>
.admin-view {
  max-width: 900px;
  margin: 0 auto;
}

.admin-view > .card {
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

.create-form {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.form-row .form-input {
  flex: 1;
  min-width: 160px;
}

.form-select {
  max-width: 180px;
  cursor: pointer;
}

.users-table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.users-table th {
  text-align: left;
  padding: 10px 16px;
  border-bottom: 2px solid var(--border-color);
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.users-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.users-table tr:last-child td {
  border-bottom: none;
}

.current-user-row {
  background: var(--bg-info-tint);
}

.username-cell {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.self-badge {
  font-size: 11px;
  background: var(--primary-color);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.role-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.role-admin {
  background: #fff3cd;
  color: #856404;
}

.role-user {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.date-cell {
  color: var(--text-secondary);
  font-size: 13px;
}

.btn-danger {
  background: var(--danger-color, #dc3545);
  color: white;
  border: none;
}

.btn-danger:hover:not(:disabled) {
  opacity: 0.85;
}

.btn-danger:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.error-message {
  background: var(--bg-danger-tint, #fef2f2);
  color: var(--text-danger-tint, #dc2626);
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
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

  .form-select {
    max-width: 100%;
  }
}
</style>
