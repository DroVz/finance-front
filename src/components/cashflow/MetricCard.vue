<template>
  <div class="metric-card" :class="`metric-${variant}`">
    <div class="metric-icon">{{ icon }}</div>
    <div class="metric-content">
      <div class="metric-label">{{ label }}</div>
      <div class="metric-value" :class="valueClass">
        {{ value }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  value: string
  variant: 'income' | 'expense' | 'net' | 'savings' | 'primary' | 'success' | 'danger'
  valueClass?: string
}>()
</script>

<style scoped>
.metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-radius: var(--radius);
  background: white;
  box-shadow: var(--shadow);
}

.metric-income {
  border-left: 4px solid var(--success-color);
}

.metric-expense {
  border-left: 4px solid var(--danger-color);
}

.metric-net {
  border-left: 4px solid var(--primary-color);
}

.metric-savings {
  border-left: 4px solid #8b5cf6;
}

/* Variants pour AccountsView */
.metric-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
}

.metric-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.metric-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.metric-icon {
  font-size: 40px;
}

.metric-content {
  flex: 1;
}

.metric-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.metric-primary .metric-label,
.metric-success .metric-label,
.metric-danger .metric-label {
  color: rgba(255, 255, 255, 0.9);
  opacity: 0.9;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
}

.metric-value.positive {
  color: var(--success-color);
}

.metric-value.negative {
  color: var(--danger-color);
}
</style>
