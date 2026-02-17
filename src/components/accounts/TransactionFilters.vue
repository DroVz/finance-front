<template>
  <div class="filters">
    <div class="filter-group">
      <label class="form-label">Compte</label>
      <select
        :value="selectedAccountId ?? ''"
        @change="handleAccountChange"
        class="form-select"
      >
        <option value="">Tous les comptes</option>
        <option
          v-for="account in accounts"
          :key="account.id"
          :value="account.id"
        >
          {{ account.name }}
        </option>
      </select>
    </div>

    <div class="filter-group">
      <label class="form-label">Type</label>
      <select
        :value="selectedType ?? ''"
        @change="handleTypeChange"
        class="form-select"
      >
        <option value="">Tous les types</option>
        <option value="INCOME">Revenus</option>
        <option value="EXPENSE">Dépenses</option>
        <option value="TRANSFER">Virements</option>
      </select>
    </div>

    <div class="filter-group">
      <label class="form-label">Description</label>
      <input
        type="text"
        class="form-select"
        placeholder="Rechercher..."
        :value="searchDescription"
        @input="handleSearchChange"
      />
    </div>

    <div class="filter-group">
      <label class="form-label">Catégorie</label>
      <select
        :value="selectedCategoryId ?? ''"
        @change="handleCategoryChange"
        class="form-select"
      >
        <option value="">Toutes les catégories</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Account, Category, TransactionType } from '@/types'

defineProps<{
  selectedAccountId: number | null
  selectedType: TransactionType | null
  selectedCategoryId: number | null
  searchDescription: string
  accounts: Account[]
  categories: Category[]
}>()

const emit = defineEmits<{
  'update:selectedAccountId': [value: number | null]
  'update:selectedType': [value: TransactionType | null]
  'update:selectedCategoryId': [value: number | null]
  'update:searchDescription': [value: string]
  'accountChange': []
}>()

const handleAccountChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  const accountId = value === '' ? null : Number(value)
  emit('update:selectedAccountId', accountId)
  emit('accountChange')
}

const handleTypeChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  const type = value === '' ? null : (value as TransactionType)
  emit('update:selectedType', type)
}

const handleSearchChange = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:searchDescription', value)
}

const handleCategoryChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  const categoryId = value === '' ? null : Number(value)
  emit('update:selectedCategoryId', categoryId)
}
</script>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.filter-group {
  flex: 1;
}
</style>
