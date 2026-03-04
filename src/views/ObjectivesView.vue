<template>
  <div class="objectives-view">
    <div class="objectives-header">
      <button class="btn btn-primary" @click="showCreateForm = true">
        ➕ Créer un objectif
      </button>
      <div v-if="activeCount" class="counter-badge">
        {{ activeCount.active_count }}/{{ activeCount.limit }} objectifs actifs
      </div>
    </div>

    <LoadingSpinner v-if="loading" />

    <EmptyState
      v-else-if="objectiveStore.objectives.length === 0"
      message="Aucun objectif d'épargne. Créez votre premier objectif !"
    />

    <div v-else class="objectives-content">
      <!-- Objectifs actifs -->
      <div v-if="activeObjectives.length > 0" class="objectives-section">
        <h3 class="section-title">📊 En cours ({{ activeObjectives.length }})</h3>
        <div class="objectives-grid">
          <ObjectiveCard
            v-for="objective in activeObjectives"
            :key="objective.id"
            :objective="objective"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- Objectifs complétés -->
      <div v-if="completedObjectives.length > 0" class="objectives-section">
        <h3 class="section-title">✅ Complétés ({{ completedObjectives.length }})</h3>
        <div class="objectives-grid">
          <ObjectiveCard
            v-for="objective in completedObjectives"
            :key="objective.id"
            :objective="objective"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>

    <!-- Modal de création -->
    <BaseModal :show="showCreateForm" @close="showCreateForm = false">
      <ObjectiveForm @close="handleFormClose" />
    </BaseModal>

    <ConfirmModal
      :show="pendingDeleteObjectiveId !== null"
      title="Supprimer cet objectif ?"
      message="Cet objectif d'épargne sera définitivement supprimé."
      @confirm="doDeleteObjective"
      @cancel="pendingDeleteObjectiveId = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useObjectiveStore } from '@/stores/objectiveStore';
import LoadingSpinner from '@/components/base/LoadingSpinner.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import ConfirmModal from '@/components/base/ConfirmModal.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import ObjectiveCard from '@/components/objectives/ObjectiveCard.vue';
import ObjectiveForm from '@/components/objectives/ObjectiveForm.vue';

const objectiveStore = useObjectiveStore();
const showCreateForm = ref(false);

const loading = computed(() => objectiveStore.loading);
const activeCount = computed(() => objectiveStore.activeCount);
const activeObjectives = computed(() => objectiveStore.activeObjectives);
const completedObjectives = computed(() => objectiveStore.completedObjectives);

const pendingDeleteObjectiveId = ref<number | null>(null);

const handleDelete = (id: number) => {
  pendingDeleteObjectiveId.value = id;
};

const doDeleteObjective = async () => {
  if (pendingDeleteObjectiveId.value === null) return;
  try {
    await objectiveStore.deleteObjective(pendingDeleteObjectiveId.value);
  } catch {
    // erreur disponible dans objectiveStore.error
  } finally {
    pendingDeleteObjectiveId.value = null;
  }
};

const handleFormClose = () => {
  showCreateForm.value = false;
};

onMounted(async () => {
  await Promise.all([
    objectiveStore.fetchObjectives(),
    objectiveStore.fetchActiveCount()
  ]);
});
</script>

<style scoped>
.objectives-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.objectives-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
}

.btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  opacity: 0.9;
}

.counter-badge {
  padding: 8px 16px;
  background: var(--bg-light);
  border-radius: 8px;
  font-weight: 500;
}

.objectives-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.objectives-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

.objectives-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .objectives-view {
    padding: 16px;
  }

  .objectives-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .counter-badge {
    text-align: center;
  }

  .objectives-grid {
    grid-template-columns: 1fr;
  }
}
</style>
