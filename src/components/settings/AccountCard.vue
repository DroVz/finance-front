<template>
  <div class="account-card">
    <div class="account-icon">{{ account.icon || '💳' }}</div>
    <div class="account-details">
      <div class="account-name">{{ account.name }}</div>
      <div class="account-info-text">
        {{ account.transactionCount }} transaction(s)
      </div>
    </div>
    <div class="account-balance">
      <div class="balance-label">Solde</div>
      <div class="balance-value">{{ formattedBalance }}</div>
    </div>
    <div class="account-actions">
      <button
        class="btn-icon"
        @click="emit('edit', account)"
        title="Modifier"
      >
        ✏️
      </button>
      <button
        class="btn-icon btn-icon-danger"
        @click="emit('delete', account.id)"
        title="Supprimer"
      >
        🗑️
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormatters } from '@/composables/useFormatters'
import type { Account } from '@/types'

const props = defineProps<{
  account: Account
}>()

const emit = defineEmits<{
  edit: [account: Account]
  delete: [id: number]
}>()

const { formatCurrency } = useFormatters()
const formattedBalance = formatCurrency(props.account.currentBalance)
</script>

<style scoped>
.account-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-light);
  border-radius: 8px;
  transition: background 0.2s;
}

.account-card:hover {
  background: #e5e7eb;
}

.account-icon {
  font-size: 40px;
}

.account-details {
  flex: 1;
}

.account-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.account-info-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.account-balance {
  text-align: right;
  margin-right: 16px;
}

.balance-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.balance-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--success-color);
}

.account-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  opacity: 0.6;
  transition: all 0.2s;
  border-radius: 4px;
}

.btn-icon:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}

.btn-icon-danger:hover {
  background: #fee2e2;
}
</style>
