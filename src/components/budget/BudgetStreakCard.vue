<template>
  <div class="streak-card" :class="{ 'streak-card--active': streak.currentStreak > 0 }">
    <div class="streak-main">
      <div class="streak-icon">{{ streak.currentStreak > 0 ? '🔥' : '💪' }}</div>
      <div class="streak-info">
        <div class="streak-count">
          <span class="streak-number">{{ streak.currentStreak }}</span>
          <span class="streak-unit">mois</span>
        </div>
        <div class="streak-label">
          {{ streak.currentStreak > 0 ? 'consécutifs respectés !' : 'Commencez votre série !' }}
        </div>
      </div>
    </div>

    <div class="streak-progress" v-if="streak.bestStreak > 0">
      <div class="streak-progress-bar">
        <div
          class="streak-progress-fill"
          :style="{ width: progressWidth + '%' }"
        ></div>
      </div>
      <div class="streak-best">Meilleure série : {{ streak.bestStreak }} mois</div>
    </div>

    <div v-if="streak.currentStreak === 0" class="streak-encourage">
      Respectez tous vos budgets ce mois-ci pour démarrer votre compteur !
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BudgetStreak } from '@/types'

const props = defineProps<{
  streak: BudgetStreak
}>()

const progressWidth = computed(() => {
  if (props.streak.bestStreak === 0) return 0
  return Math.round((props.streak.currentStreak / props.streak.bestStreak) * 100)
})
</script>

<style scoped>
.streak-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 20px 24px;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08));
  margin-bottom: 24px;
  border-left: 4px solid var(--border-color);
  transition: border-color 0.3s;
}

.streak-card--active {
  border-left-color: var(--success-color);
}

.streak-main {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.streak-icon {
  font-size: 36px;
  line-height: 1;
}

.streak-count {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.streak-number {
  font-size: 36px;
  font-weight: 700;
  color: var(--success-color);
  line-height: 1;
}

.streak-unit {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
}

.streak-label {
  font-size: 15px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.streak-progress {
  margin-top: 8px;
}

.streak-progress-bar {
  height: 6px;
  background: var(--bg-hover);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.streak-progress-fill {
  height: 100%;
  background: var(--success-color);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.streak-best {
  font-size: 13px;
  color: var(--text-secondary);
}

.streak-encourage {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
  font-style: italic;
}
</style>
