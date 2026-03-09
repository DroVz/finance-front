<template>
  <div class="type-breakdown">
    <h3 class="section-title">Répartition des dépenses par type</h3>

    <div v-if="expenseItems.length > 0" class="type-list">
      <div v-for="item in expenseItems" :key="item.key" class="type-item">
        <div class="type-header">
          <span class="type-label">
            <span class="type-dot" :style="{ background: item.color }"></span>
            {{ item.label }}
          </span>
          <div class="type-right">
            <span class="type-percent">{{ item.percent }}%</span>
            <span class="type-amount" :style="{ color: item.color }">{{ formatCurrency(item.amount) }}</span>
          </div>
        </div>
        <div class="type-bar-track">
          <div
            class="type-bar-fill"
            :style="{ width: item.percent + '%', background: item.color }"
          ></div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Aucune dépense catégorisée par type pour cette période</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CashFlowStats } from '@/types';
import { useFormatters } from '@/composables/useFormatters';

const props = defineProps<{
  stats: CashFlowStats
}>();

const { formatCurrency } = useFormatters();

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  CHARGES: { label: 'Charges fixes', color: 'var(--danger-color)' },
  LOISIRS: { label: 'Loisirs & quotidien', color: '#8b5cf6' },
  REVENUS: { label: 'Revenus', color: 'var(--success-color)' },
};

const expenseItems = computed(() =>
  Object.entries(props.stats.expensesByType ?? {})
    .map(([key, amount]) => ({
      key,
      label: TYPE_CONFIG[key]?.label ?? key,
      color: TYPE_CONFIG[key]?.color ?? 'var(--text-secondary)',
      amount,
      percent: props.stats.totalExpenses > 0
        ? Math.round((amount / props.stats.totalExpenses) * 100)
        : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
);
</script>

<style scoped>
.type-breakdown {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.type-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.type-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-percent {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 36px;
  text-align: right;
}

.type-amount {
  font-size: 16px;
  font-weight: 700;
  min-width: 90px;
  text-align: right;
}

.type-bar-track {
  height: 8px;
  background: var(--bg-hover);
  border-radius: 4px;
  overflow: hidden;
}

.type-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-style: italic;
}

@media (max-width: 768px) {
  .type-breakdown {
    padding: 16px;
  }
}
</style>
