<template>
  <form @submit.prevent="emit('submit')" class="transaction-form">
    <div class="form-group">
      <label class="form-label">Date *</label>
      <input
        :value="modelValue.transactionDate"
        @input="updateField('transactionDate', ($event.target as HTMLInputElement).value)"
        type="date"
        class="form-input"
        required
      />
    </div>

    <div class="form-group">
      <label class="form-label">Montant (€) *</label>
      <input
        :value="modelValue.amount"
        @input="updateField('amount', Number(($event.target as HTMLInputElement).value))"
        type="number"
        step="0.01"
        class="form-input"
        placeholder="0.00"
        required
      />
    </div>

    <div class="form-group">
      <label class="form-label">Catégorie *</label>
      <select
        :value="modelValue.categoryId"
        @change="updateField('categoryId', Number(($event.target as HTMLSelectElement).value))"
        class="form-select"
        required
      >
        <option :value="null" disabled>Sélectionner une catégorie</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">Compte *</label>
      <select
        :value="modelValue.accountId"
        @change="updateField('accountId', Number(($event.target as HTMLSelectElement).value))"
        class="form-select"
        required
      >
        <option :value="null" disabled>Compte courant</option>
        <option
          v-for="account in accounts"
          :key="account.id"
          :value="account.id"
        >
          {{ account.name }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea
        :value="modelValue.description"
        @input="updateField('description', ($event.target as HTMLTextAreaElement).value)"
        class="form-textarea"
        placeholder="Note optionnelle..."
      ></textarea>
    </div>

    <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
      {{ loading ? 'Ajout en cours...' : '➕ Ajouter la transaction' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import type { TransactionDTO, Account, Category } from '@/types'

const props = defineProps<{
  modelValue: TransactionDTO
  categories: Category[]
  accounts: Account[]
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TransactionDTO]
  submit: []
}>()

const updateField = (field: keyof TransactionDTO, value: any) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}
</script>

<style scoped>
.transaction-form {
  margin-top: 24px;
}

.btn-block {
  width: 100%;
  margin-top: 8px;
}
</style>
