<template>
  <div class="objective-card" :class="`status-${objective.status.toLowerCase()}`">
    <div class="card-header">
      <h4 class="objective-name">{{ objective.name }}</h4>
      <button class="btn-delete" @click="$emit('delete', objective.id)" title="Supprimer">
        <IconTrash :size="16" />
      </button>
    </div>

    <div class="objective-amount">
      <div class="current-amount">{{ formatCurrency(objective.currentAmount) }}</div>
      <div class="target-amount">sur {{ formatCurrency(objective.targetAmount) }}</div>
    </div>

    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: `${Math.min(objective.progressPercentage, 100)}%` }"
      ></div>
    </div>
    <div class="progress-text">{{ objective.progressPercentage.toFixed(1) }}% atteint</div>

    <div class="objective-info">
      <div v-if="objective.targetDate" class="info-row">
        <span class="info-icon">📅</span>
        <span>{{ formatDate(objective.targetDate) }}</span>
        <span v-if="objective.monthsRemaining" class="info-badge">
          {{ objective.monthsRemaining }} mois restants
        </span>
      </div>
      <div v-else class="info-row">
        <span class="info-icon">⏱️</span>
        <span>Pas de date limite</span>
      </div>

      <div v-if="objective.monthlyEffortRequired" class="info-row">
        <span class="info-icon">💰</span>
        <span>{{ formatCurrency(objective.monthlyEffortRequired) }}/mois recommandé</span>
      </div>

      <div v-if="objective.accountName" class="info-row">
        <span class="info-icon">🏦</span>
        <span>{{ objective.accountName }}</span>
      </div>
    </div>

    <div v-if="objective.status === 'COMPLETED'" class="completed-badge">
      ✅ Objectif atteint !
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormatters } from '@/composables/useFormatters';
import type { Objective } from '@/types';
import IconTrash from '@/components/base/IconTrash.vue';

defineProps<{
  objective: Objective;
}>();

defineEmits<{
  delete: [id: number];
}>();

const { formatCurrency, formatDate } = useFormatters();
</script>

<style scoped>
.objective-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.objective-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.objective-name {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
  margin: 0;
}

.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: var(--bg-icon-danger-hover);
  color: var(--color-icon-danger-hover);
}

.objective-amount {
  margin-bottom: 12px;
}

.current-amount {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color);
}

.target-amount {
  font-size: 14px;
  color: var(--text-secondary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-hover);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--success-color));
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.objective-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.info-icon {
  font-size: 16px;
}

.info-badge {
  margin-left: auto;
  padding: 2px 8px;
  background: var(--bg-item);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.completed-badge {
  margin-top: 12px;
  padding: 8px;
  background: var(--bg-success-tint);
  color: var(--text-success-tint);
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
}

.status-completed {
  border: 2px solid var(--success-color);
}

@media (max-width: 768px) {
  .objective-card {
    padding: 16px;
  }

  .objective-name {
    font-size: 16px;
  }

  .current-amount {
    font-size: 24px;
  }
}
</style>
