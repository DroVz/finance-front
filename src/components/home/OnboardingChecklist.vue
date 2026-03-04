<template>
  <div class="onboarding-card">
    <div class="onboarding-header">
      <div class="title-group">
        <h2 class="onboarding-title">🚀 Prise en main</h2>
        <span class="progress-label">{{ completedCount }}/{{ steps.length }} étapes</span>
      </div>
      <button class="dismiss-btn" @click="$emit('dismiss')" title="Masquer">✕</button>
    </div>

    <div class="progress-track">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <div v-if="allDone" class="all-done">
      <span class="all-done-icon">🎉</span>
      <div>
        <strong>Configuration terminée !</strong>
        <p>Vous êtes prêt à suivre vos finances.</p>
      </div>
    </div>

    <div v-else class="steps-list">
      <RouterLink
        v-for="step in steps"
        :key="step.id"
        :to="step.link"
        class="step-item"
        :class="{ 'step-done': step.done, 'step-pending': !step.done }"
      >
        <span class="step-icon">{{ step.done ? '✅' : '⬜' }}</span>
        <div class="step-content">
          <span class="step-label">{{ step.label }}</span>
          <span class="step-desc">{{ step.description }}</span>
        </div>
        <span v-if="!step.done" class="step-arrow">›</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

export interface ChecklistStep {
  id: string
  label: string
  description: string
  link: string
  done: boolean
}

const props = defineProps<{
  steps: ChecklistStep[]
}>()

defineEmits<{ dismiss: [] }>()

const completedCount = computed(() => props.steps.filter(s => s.done).length)
const allDone = computed(() => completedCount.value === props.steps.length)
const progressPercent = computed(() => Math.round((completedCount.value / props.steps.length) * 100))
</script>

<style scoped>
.onboarding-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--primary-color);
  margin-bottom: 24px;
}

.onboarding-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.onboarding-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.progress-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-hover);
  padding: 2px 8px;
  border-radius: 12px;
}

.dismiss-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
  line-height: 1;
}

.dismiss-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.progress-track {
  height: 6px;
  background: var(--bg-hover);
  border-radius: 3px;
  margin-bottom: 20px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.all-done {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--bg-success-tint);
  border-radius: 8px;
  color: var(--text-success-tint);
}

.all-done-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.all-done strong {
  display: block;
  font-size: 16px;
  margin-bottom: 2px;
}

.all-done p {
  font-size: 13px;
  opacity: 0.8;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.15s;
}

.step-done {
  cursor: default;
  pointer-events: none;
  opacity: 0.6;
}

.step-pending:hover {
  background: var(--bg-hover);
}

.step-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.step-desc {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 1px;
}

.step-arrow {
  font-size: 20px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .onboarding-card {
    padding: 16px;
  }
}
</style>
