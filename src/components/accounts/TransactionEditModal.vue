<template>
  <BaseModal :show="show" @close="emit('close')">
    <h3 class="modal-title">Modifier la transaction</h3>

    <form @submit.prevent="handleSave" class="edit-form">
      <div class="form-group">
        <label class="form-label">Montant (€) *</label>
        <input
          v-model.number="form.amount"
          type="number"
          step="0.01"
          class="form-input"
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label">Catégorie</label>
        <select v-model.number="form.categoryId" class="form-select">
          <option :value="null">Sans catégorie</option>
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
        <label class="form-label">Description</label>
        <textarea
          v-model="form.description"
          class="form-textarea"
          placeholder="Note optionnelle..."
        ></textarea>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn" @click="emit('close')">Annuler</button>
        <button type="submit" class="btn btn-primary">Enregistrer</button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import type { Transaction, TransactionDTO, Category } from '@/types'

const props = defineProps<{
  show: boolean
  transaction: Transaction | null
  categories: Category[]
}>()

const emit = defineEmits<{
  close: []
  save: [dto: TransactionDTO]
}>()

const form = reactive({
  amount: 0,
  categoryId: null as number | null,
  description: null as string | null,
})

watch(
  () => props.transaction,
  (t) => {
    if (t) {
      form.amount = t.amount
      form.categoryId = t.categoryId
      form.description = t.description
    }
  },
  { immediate: true }
)

const handleSave = () => {
  if (!props.transaction) return
  const dto: TransactionDTO = {
    accountId: props.transaction.accountId,
    categoryId: form.categoryId,
    amount: form.amount,
    type: props.transaction.type,
    description: form.description,
    transactionDate: props.transaction.transactionDate,
  }
  emit('save', dto)
}
</script>

<style scoped>
.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
