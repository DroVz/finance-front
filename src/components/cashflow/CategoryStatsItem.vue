<template>
  <div class="category-item">
    <div class="category-info">
      <div class="category-name">{{ categoryName }}</div>
      <div class="category-percentage">{{ percentage }}%</div>
    </div>
    <div class="category-bar">
      <div
        class="category-bar-fill"
        :class="`category-bar-${type}`"
        :style="{ width: percentage + '%' }"
      ></div>
    </div>
    <div class="category-amount">{{ formattedAmount }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  categoryName: string
  percentage: string
  formattedAmount: string
  type: 'expense' | 'income'
}>()
</script>

<style scoped>
.category-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-name {
  font-weight: 600;
  font-size: 15px;
}

.category-percentage {
  font-size: 14px;
  color: var(--text-secondary);
}

.category-bar {
  height: 8px;
  background: var(--bg-light);
  border-radius: 4px;
  overflow: hidden;
}

.category-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.category-bar-expense {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.category-bar-income {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.category-amount {
  font-size: 18px;
  font-weight: 700;
  text-align: right;
}
</style>
