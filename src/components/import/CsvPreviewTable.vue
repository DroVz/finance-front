<template>
  <div class="csv-preview-table">
    <div class="preview-header">
      <span class="format-badge">{{ detectedFormat }}</span>
      <span class="line-count">{{ lines.length }} transactions détectées</span>
    </div>

    <div class="table-wrapper">
      <table class="preview-table">
        <thead>
          <tr>
            <th class="col-number">#</th>
            <th class="col-date">Date</th>
            <th class="col-description">Description</th>
            <th class="col-amount">Montant</th>
            <th class="col-type">Type</th>
            <th class="col-internal">Interne</th>
            <th class="col-category">Catégorie / Compte lié</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="line in lines"
            :key="line.lineNumber"
            :class="{ 'row-transfer': isMarkedAsTransfer(line) }"
          >
            <td class="col-number">{{ line.lineNumber }}</td>
            <td class="col-date">{{ formatDate(line.date) }}</td>
            <td class="col-description" :title="line.description">{{ line.description }}</td>
            <td class="col-amount" :class="line.type === 'EXPENSE' ? 'amount-expense' : 'amount-income'">
              {{ line.type === 'EXPENSE' ? '-' : '+' }}{{ line.amount.toFixed(2) }} €
            </td>
            <td class="col-type">
              <span v-if="!isMarkedAsTransfer(line)" class="badge" :class="line.type === 'EXPENSE' ? 'badge-expense' : 'badge-income'">
                {{ line.type === 'EXPENSE' ? 'Dépense' : 'Revenu' }}
              </span>
              <span v-else class="badge badge-transfer">Interne</span>
            </td>
            <td class="col-internal">
              <input
                type="checkbox"
                :checked="isMarkedAsTransfer(line)"
                @change="toggleTransfer(line.lineNumber)"
              />
            </td>
            <td class="col-category">
              <!-- Si virement : sélection du compte lié -->
              <select
                v-if="isMarkedAsTransfer(line)"
                class="category-select"
                :value="getLinkedAccountId(line)"
                @change="updateLinkedAccount(line.lineNumber, Number(($event.target as HTMLSelectElement).value))"
              >
                <option :value="0">-- Compte lié --</option>
                <option
                  v-for="account in accounts"
                  :key="account.id"
                  :value="account.id"
                >
                  {{ account.name }}
                </option>
              </select>
              <!-- Sinon : sélection de la catégorie -->
              <select
                v-else
                class="category-select"
                :value="getCategoryId(line)"
                @change="updateCategory(line.lineNumber, Number(($event.target as HTMLSelectElement).value))"
              >
                <option :value="0">-- Choisir --</option>
                <option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CsvPreviewLine, Category, Account } from '@/types'

defineProps<{
  lines: CsvPreviewLine[]
  categories: Category[]
  accounts: Account[]
  detectedFormat: string
}>()

const emit = defineEmits<{
  'update-category': [lineNumber: number, categoryId: number]
  'toggle-transfer': [lineNumber: number]
  'update-linked-account': [lineNumber: number, accountId: number]
}>()

const getCategoryId = (line: CsvPreviewLine): number => {
  return line.suggestedCategoryId ?? 0
}

const isMarkedAsTransfer = (line: CsvPreviewLine): boolean => {
  return (line as any)._isTransfer === true
}

const getLinkedAccountId = (line: CsvPreviewLine): number => {
  return (line as any)._linkedAccountId ?? 0
}

const updateCategory = (lineNumber: number, categoryId: number) => {
  emit('update-category', lineNumber, categoryId)
}

const toggleTransfer = (lineNumber: number) => {
  emit('toggle-transfer', lineNumber)
}

const updateLinkedAccount = (lineNumber: number, accountId: number) => {
  emit('update-linked-account', lineNumber, accountId)
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR')
}
</script>

<style scoped>
.csv-preview-table {
  margin-top: 16px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.format-badge {
  background: var(--primary-color);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.line-count {
  color: var(--text-secondary);
  font-size: 14px;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: fixed;
}

.preview-table th {
  background: var(--bg-item);
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}

.preview-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
}

.preview-table tr:last-child td {
  border-bottom: none;
}

.preview-table tr:hover {
  background: var(--bg-hover);
}

.row-transfer {
  background: var(--bg-selected);
}

.row-transfer:hover {
  background: var(--bg-info-tint);
}

/* Largeurs fixes des colonnes */
.col-number {
  width: 36px;
  color: var(--text-secondary);
  font-size: 12px;
  text-align: center;
}

.col-date {
  width: 90px;
  white-space: nowrap;
}

.col-description {
  width: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-amount {
  width: 110px;
  font-weight: 600;
  white-space: nowrap;
  text-align: right;
}

.col-type {
  width: 100px;
  white-space: nowrap;
}

.col-internal {
  width: 60px;
  text-align: center;
}

.col-internal input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.col-category {
  width: 200px;
}

.amount-expense {
  color: var(--danger-color);
}

.amount-income {
  color: var(--success-color);
}

.category-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  background: var(--bg-input);
  color: var(--text-primary);
}

.category-select:focus {
  outline: none;
  border-color: var(--primary-color);
}
</style>
