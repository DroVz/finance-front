<template>
  <div class="transaction-item">
    <div
      class="transaction-icon"
      :class="!transaction.categoryColor ? `icon-${transaction.type.toLowerCase()}` : ''"
      :style="transaction.categoryColor ? { background: transaction.categoryColor + '20', color: transaction.categoryColor } : {}"
    >
      {{ icon }}
    </div>

    <div class="transaction-info">
      <div class="transaction-header">
        <span class="transaction-category">{{ transaction.categoryName || 'Virement' }}</span>
        <span class="transaction-account-badge">{{ transaction.accountName }}</span>
      </div>
      <div class="transaction-description">
        {{ transaction.description || 'Aucune description' }}
      </div>
      <div class="transaction-date">
        {{ formattedDate }}
      </div>
    </div>

    <div class="transaction-amount" :class="`amount-${transaction.type.toLowerCase()}`">
      {{ formattedAmount }}
    </div>

    <button
      class="btn-delete"
      @click="emit('delete', transaction.id)"
      title="Supprimer"
    >
      🗑️
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'
import type { Transaction } from '@/types'

const props = defineProps<{
  transaction: Transaction
}>()

const emit = defineEmits<{
  delete: [id: number]
}>()

const { formatDate, formatTransactionAmount, getTransactionIcon } = useFormatters()

const icon = computed(() => getTransactionIcon(props.transaction.type))
const formattedDate = computed(() => formatDate(props.transaction.transactionDate))
const formattedAmount = computed(() => formatTransactionAmount(props.transaction))
</script>

<style scoped>
.transaction-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-light);
  border-radius: 8px;
  transition: all 0.2s;
}

.transaction-item:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.transaction-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.icon-income {
  background: #d1fae5;
}

.icon-expense {
  background: #fee2e2;
}

.icon-transfer {
  background: #dbeafe;
}

.transaction-info {
  flex: 1;
}

.transaction-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.transaction-category {
  font-weight: 600;
  font-size: 16px;
}

.transaction-account-badge {
  padding: 2px 8px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.transaction-description {
  font-size: 14px;
  color: var(--text-primary, #374151);
  margin-bottom: 2px;
}

.transaction-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.transaction-amount {
  font-size: 20px;
  font-weight: 700;
  min-width: 120px;
  text-align: right;
}

.amount-income {
  color: var(--success-color);
}

.amount-expense {
  color: var(--danger-color);
}

.amount-transfer {
  color: var(--primary-color);
}

.btn-delete {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.btn-delete:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .transaction-item {
    flex-wrap: wrap;
  }

  .transaction-amount {
    width: 100%;
    text-align: left;
    margin-top: 8px;
  }
}
</style>
