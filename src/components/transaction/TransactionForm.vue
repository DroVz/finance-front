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
        <option v-if="defaultCategoryId" :value="defaultCategoryId" disabled>Non attribué (par défaut)</option>
        <option v-else :value="null" disabled>Sélectionner une catégorie</option>
        <optgroup v-if="chargesCategories.length" label="Charges">
          <option v-for="c in chargesCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </optgroup>
        <optgroup v-if="loisirsCategories.length" label="Loisirs & quotidien">
          <option v-for="c in loisirsCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </optgroup>
        <optgroup v-if="revenusCategories.length" label="Revenus">
          <option v-for="c in revenusCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </optgroup>
        <optgroup v-if="otherCategories.length" label="Autres">
          <option v-for="c in otherCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </optgroup>
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
import { computed } from 'vue'
import type { TransactionDTO, Account, Category } from '@/types'

const props = defineProps<{
  modelValue: TransactionDTO
  categories: Category[]
  accounts: Account[]
  loading: boolean
  defaultCategoryId?: number | null
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

const nonDefaultCategories = computed(() => props.categories.filter(c => !c.defaultCategory))
const chargesCategories = computed(() => nonDefaultCategories.value.filter(c => c.type === 'CHARGES'))
const loisirsCategories = computed(() => nonDefaultCategories.value.filter(c => c.type === 'LOISIRS'))
const revenusCategories = computed(() => nonDefaultCategories.value.filter(c => c.type === 'REVENUS'))
const otherCategories = computed(() => nonDefaultCategories.value.filter(c => !c.type))
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
