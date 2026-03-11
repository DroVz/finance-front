<template>
  <div class="transaction-item" :class="{ selected }">
    <!-- Checkbox multi-sélection (invisible pour les virements, mais garde l'espace) -->
    <input
      type="checkbox"
      class="transaction-checkbox"
      :class="{
        visible: selectionActive && !isTransfer,
        'sr-hidden': isTransfer,
      }"
      :checked="selected"
      @change="!isTransfer && emit('toggle-select', transaction.id)"
      @click.stop
    />

    <div
      class="transaction-icon"
      :class="
        !transaction.categoryColor
          ? `icon-${transaction.type.toLowerCase()}`
          : ''
      "
      :style="
        transaction.categoryColor
          ? {
              background: transaction.categoryColor + '20',
              color: transaction.categoryColor,
            }
          : {}
      "
    >
      {{ icon }}
    </div>

    <div class="transaction-info">
      <div class="transaction-header">
        <span class="transaction-category">{{
          transaction.categoryName || "Virement"
        }}</span>
        <span class="transaction-account-badge">{{
          transaction.accountName
        }}</span>
      </div>
      <div class="transaction-description">
        {{ transaction.description || "Aucune description" }}
      </div>
      <div class="transaction-date">
        {{ formattedDate }}
      </div>
    </div>

    <div
      class="transaction-amount"
      :class="`amount-${transaction.type.toLowerCase()}`"
    >
      {{ formattedAmount }}
    </div>

    <div class="transaction-actions">
      <button
        class="btn-action"
        title="Modifier"
        @click="emit('edit', transaction)"
      >
        <IconEdit :size="16" />
      </button>

      <button
        class="btn-action btn-action-danger"
        title="Supprimer"
        @click="emit('delete', transaction.id)"
      >
        <IconTrash :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useFormatters } from "@/composables/useFormatters";
import type { Transaction } from "@/types";
import IconTrash from "@/components/base/IconTrash.vue";
import IconEdit from "@/components/base/IconEdit.vue";

const props = defineProps<{
  transaction: Transaction;
  selected?: boolean;
  selectionActive?: boolean;
}>();

const emit = defineEmits<{
  delete: [id: number];
  edit: [transaction: Transaction];
  "toggle-select": [id: number];
}>();

const { formatDate, formatTransactionAmount, getTransactionIcon } =
  useFormatters();

const isTransfer = computed(
  () => props.transaction.linkedTransactionId !== null,
);
const icon = computed(() => getTransactionIcon(props.transaction.type));
const formattedDate = computed(() =>
  formatDate(props.transaction.transactionDate),
);
const formattedAmount = computed(() =>
  formatTransactionAmount(props.transaction),
);
</script>

<style scoped>
.transaction-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-item);
  border-radius: 8px;
  transition: all 0.2s;
}

.transaction-item:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.transaction-item.selected {
  background: var(--bg-selected);
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

/* Checkbox */
.transaction-checkbox {
  opacity: 0;
  width: 18px;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: var(--primary-color);
  transition: opacity 0.15s;
}

.transaction-checkbox.visible,
.transaction-item:hover .transaction-checkbox:not(.sr-hidden) {
  opacity: 1;
}

.transaction-checkbox.sr-hidden {
  visibility: hidden;
  pointer-events: none;
}

.transaction-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.icon-income {
  background: var(--bg-success-tint);
}

.icon-expense {
  background: var(--bg-danger-tint);
}

.icon-transfer {
  background: var(--bg-info-tint);
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
  background: var(--bg-hover);
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

/* Actions (crayon + corbeille) */
.transaction-actions {
  display: flex;
  gap: 4px;
}

.btn-action {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  border-radius: 6px;
}

.btn-action:hover {
  color: var(--primary-color);
  background: var(--bg-icon-hover);
}

.btn-action-danger:hover {
  background: var(--bg-icon-danger-hover);
  color: var(--color-icon-danger-hover);
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
