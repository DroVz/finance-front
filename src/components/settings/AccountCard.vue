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
        <IconEdit :size="16" />
      </button>
      <button
        class="btn-icon btn-icon-danger"
        @click="emit('delete', account.id)"
        title="Supprimer"
      >
        <IconTrash :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'
import type { Account } from '@/types'
import IconTrash from '@/components/base/IconTrash.vue'
import IconEdit from '@/components/base/IconEdit.vue'

const props = defineProps<{
  account: Account
}>()

const emit = defineEmits<{
  edit: [account: Account]
  delete: [id: number]
}>()

const { formatCurrency } = useFormatters()
const formattedBalance = computed(() => formatCurrency(props.account.currentBalance))
</script>

<style scoped>
.account-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-item);
  border-radius: 8px;
  transition: background 0.2s;
}

.account-card:hover {
  background: var(--bg-hover);
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
  color: var(--text-secondary);
  transition: all 0.2s;
  border-radius: 4px;
}

.btn-icon:hover {
  color: var(--primary-color);
  background: var(--bg-icon-hover);
}

.btn-icon-danger:hover {
  background: var(--bg-icon-danger-hover);
  color: var(--color-icon-danger-hover);
}
</style>
