<template>
  <div class="account-item">
    <div class="account-info">
      <div class="account-icon">{{ account.icon || '💳' }}</div>
      <div>
        <div class="account-name">{{ account.name }}</div>
        <div class="account-transactions">{{ account.transactionCount }} transaction(s)</div>
      </div>
    </div>
    <div class="account-balance">{{ formattedBalance }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'
import type { Account } from '@/types'

const props = defineProps<{
  account: Account
}>()

const { formatCurrency } = useFormatters()

const formattedBalance = computed(() => formatCurrency(props.account.currentBalance))
</script>

<style scoped>
.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-item);
  border-radius: 8px;
  transition: background 0.2s;
}

.account-item:hover {
  background: var(--bg-hover);
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-icon {
  font-size: 32px;
}

.account-name {
  font-weight: 600;
  font-size: 16px;
}

.account-transactions {
  font-size: 14px;
  color: var(--text-secondary);
}

.account-balance {
  font-size: 20px;
  font-weight: 700;
  color: var(--success-color);
}
</style>
