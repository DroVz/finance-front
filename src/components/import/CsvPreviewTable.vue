<template>
  <div class="csv-preview-table">
    <div class="preview-header">
      <span class="format-badge">{{ detectedFormat }}</span>
      <span class="line-count">{{ activeCount }} / {{ totalCount }} transactions sélectionnées</span>
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
            <th class="col-ignore"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="line in lines" :key="line.lineNumber">
            <!-- Ligne principale (représentante de groupe ou ligne unique) -->
            <tr
              :class="{
                'row-transfer': isMarkedAsTransfer(line) && !isIgnored(line),
                'row-ignored': isIgnored(line)
              }"
            >
              <td class="col-number">
                <button
                  v-if="(line as any)._groupCount > 1"
                  class="btn-expand"
                  :title="(line as any)._expandedGroup ? 'Réduire' : 'Voir les dates'"
                  @click="emit('toggle-expand', line.lineNumber)"
                >{{ (line as any)._expandedGroup ? '▼' : '▶' }}</button>
                <span class="line-number">{{ line.lineNumber }}</span>
              </td>
              <td class="col-date">{{ formatDate(line.date) }}</td>
              <td class="col-description" :title="line.description">{{ line.description }}</td>
              <td class="col-amount" :class="line.type === 'EXPENSE' ? 'amount-expense' : 'amount-income'">
                {{ line.type === 'EXPENSE' ? '-' : '+' }}{{ line.amount.toFixed(2) }} €
              </td>
              <td class="col-type">
                <span v-if="isIgnored(line) && (line as any).potentialDuplicate" class="badge badge-duplicate">Doublon probable</span>
                <span v-else-if="isIgnored(line)" class="badge badge-ignored">Ignorée</span>
                <template v-else-if="!isMarkedAsTransfer(line)">
                  <span class="badge" :class="line.type === 'EXPENSE' ? 'badge-expense' : 'badge-income'">
                    {{ line.type === 'EXPENSE' ? 'Dépense' : 'Revenu' }}<span v-if="(line as any)._groupCount > 1"> ×{{ (line as any)._groupCount }}</span>
                  </span>
                </template>
                <span v-else class="badge badge-transfer">Interne<span v-if="(line as any)._groupCount > 1"> ×{{ (line as any)._groupCount }}</span></span>
              </td>
              <td class="col-internal">
                <input
                  v-if="!isIgnored(line)"
                  type="checkbox"
                  :checked="isMarkedAsTransfer(line)"
                  @change="toggleTransfer(line.lineNumber)"
                />
              </td>
              <td class="col-category">
                <template v-if="!isIgnored(line)">
                  <!-- Si virement : sélection du compte lié + objectif optionnel -->
                  <template v-if="isMarkedAsTransfer(line)">
                    <select
                      class="category-select"
                      :value="getLinkedAccountId(line)"
                      @change="updateLinkedAccount(line.lineNumber, Number(($event.target as HTMLSelectElement).value))"
                    >
                      <option :value="0">-- Compte lié --</option>
                      <option
                        v-for="account in linkedAccountOptions"
                        :key="account.id"
                        :value="account.id"
                      >
                        {{ account.name }}
                      </option>
                    </select>
                    <select
                      v-if="objectives.length > 0"
                      class="category-select objective-select"
                      :value="getLinkedObjectiveId(line)"
                      @change="updateLinkedObjective(line.lineNumber, Number(($event.target as HTMLSelectElement).value))"
                    >
                      <option :value="0">🎯 Objectif (optionnel)</option>
                      <option
                        v-for="obj in objectives"
                        :key="obj.id"
                        :value="obj.id"
                      >
                        {{ obj.name }}
                      </option>
                    </select>
                  </template>
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
                </template>
              </td>
              <td class="col-ignore">
                <button
                  class="btn-ignore"
                  :class="{ 'is-ignored': isIgnored(line) }"
                  :title="isIgnored(line) ? 'Réactiver' : 'Ignorer cette transaction'"
                  @click="toggleIgnore(line.lineNumber)"
                >
                  <span v-if="isIgnored(line)">↩</span>
                  <span v-else>✕</span>
                </button>
              </td>
            </tr>

            <!-- Lignes enfants de l'accordéon (lecture seule) -->
            <template v-if="(line as any)._expandedGroup && (line as any)._groupChildren?.length">
              <tr
                v-for="child in (line as any)._groupChildren"
                :key="`child-${child.lineNumber}`"
                class="row-child"
              >
                <td class="col-number"></td>
                <td class="col-date">{{ formatDate(child.date) }}</td>
                <td class="col-description" :title="child.description">{{ child.description }}</td>
                <td class="col-amount" :class="child.type === 'EXPENSE' ? 'amount-expense' : 'amount-income'">
                  {{ child.type === 'EXPENSE' ? '-' : '+' }}{{ child.amount.toFixed(2) }} €
                </td>
                <td colspan="4"></td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CsvPreviewLine, Category, Account, Objective } from '@/types'

const props = defineProps<{
  lines: CsvPreviewLine[]
  categories: Category[]
  accounts: Account[]
  objectives: Objective[]
  detectedFormat: string
  sourceAccountId: number | null
}>()

const linkedAccountOptions = computed(() =>
  props.accounts.filter(a => a.id !== props.sourceAccountId)
)

// Compteurs tenant compte des groupes (_groupCount lignes réelles par représentante)
const totalCount = computed(() =>
  props.lines.reduce((sum, l) => sum + ((l as any)._groupCount ?? 1), 0)
)

const activeCount = computed(() =>
  props.lines
    .filter(l => !(l as any)._ignored)
    .reduce((sum, l) => sum + ((l as any)._groupCount ?? 1), 0)
)

const emit = defineEmits<{
  'update-category': [lineNumber: number, categoryId: number]
  'toggle-transfer': [lineNumber: number]
  'update-linked-account': [lineNumber: number, accountId: number]
  'update-linked-objective': [lineNumber: number, objectiveId: number | null]
  'toggle-ignore': [lineNumber: number]
  'toggle-expand': [lineNumber: number]
}>()

const getCategoryId = (line: CsvPreviewLine): number => {
  return line.suggestedCategoryId ?? 0
}

const isMarkedAsTransfer = (line: CsvPreviewLine): boolean => {
  return (line as any)._isTransfer === true
}

const isIgnored = (line: CsvPreviewLine): boolean => {
  return (line as any)._ignored === true
}

const getLinkedAccountId = (line: CsvPreviewLine): number => {
  return (line as any)._linkedAccountId ?? 0
}

const getLinkedObjectiveId = (line: CsvPreviewLine): number => {
  return (line as any)._objectiveId ?? 0
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

const updateLinkedObjective = (lineNumber: number, objectiveId: number) => {
  emit('update-linked-objective', lineNumber, objectiveId > 0 ? objectiveId : null)
}

const toggleIgnore = (lineNumber: number) => {
  emit('toggle-ignore', lineNumber)
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

.preview-table th.col-amount {
  text-align: right;
}

.preview-table th.col-internal {
  text-align: center;
}

.preview-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
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

/* Ligne ignorée */
.row-ignored {
  opacity: 0.4;
}

.row-ignored:hover {
  opacity: 0.6;
  background: var(--bg-hover);
}

/* Lignes enfants de l'accordéon */
.row-child td {
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-size: 12px;
  padding: 4px 12px;
  border-top: none;
}

.row-child:hover td {
  background: var(--bg-hover);
}

/* Largeurs fixes des colonnes */
.col-number {
  width: 52px;
  color: var(--text-secondary);
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
}

.line-number {
  display: inline-block;
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
  width: 115px;
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

.col-ignore {
  width: 36px;
  text-align: center;
}

/* Bouton accordéon ▶/▼ */
.btn-expand {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 2px;
  color: var(--text-secondary);
  font-size: 9px;
  line-height: 1;
  vertical-align: middle;
  transition: color 0.15s;
}

.btn-expand:hover {
  color: var(--primary-color);
}

/* Bouton ignorer / réactiver */
.btn-ignore {
  padding: 4px 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 4px;
  font-size: 13px;
  line-height: 1;
  opacity: 0;
  transition: all 0.15s;
}

.preview-table tr:hover .btn-ignore,
.btn-ignore.is-ignored {
  opacity: 1;
}

.btn-ignore:hover {
  color: var(--danger-color);
  background: var(--bg-icon-danger-hover);
}

.btn-ignore.is-ignored {
  color: var(--text-secondary);
}

.btn-ignore.is-ignored:hover {
  color: var(--success-color);
  background: var(--bg-success-tint);
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

.objective-select {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

/* Badges */
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-expense {
  background: var(--bg-danger-tint);
  color: var(--danger-color);
}

.badge-income {
  background: var(--bg-success-tint);
  color: var(--success-color);
}

.badge-transfer {
  background: var(--bg-info-tint);
  color: var(--primary-color);
}

.badge-ignored {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.badge-duplicate {
  background: var(--bg-warning-tint);
  color: var(--text-warning-tint);
}
</style>
