<template>
  <form @submit.prevent="handleSubmit" class="transaction-form">
    <div class="form-row">
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
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Compte source *</label>
        <select
          :value="modelValue.sourceAccountId"
          @change="updateField('sourceAccountId', Number(($event.target as HTMLSelectElement).value))"
          class="form-select"
          required
        >
          <option :value="null" disabled>Compte source</option>
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
        <label class="form-label">Compte destination *</label>
        <select
          :value="modelValue.destinationAccountId"
          @change="updateField('destinationAccountId', Number(($event.target as HTMLSelectElement).value))"
          class="form-select"
          required
        >
          <option :value="null" disabled>Compte destination</option>
          <option
            v-for="account in accounts"
            :key="account.id"
            :value="account.id"
            :disabled="account.id === modelValue.sourceAccountId"
          >
            {{ account.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">🎯 Objectif associé (optionnel)</label>
      <select
        :value="modelValue.objectiveId || ''"
        @change="updateField('objectiveId', ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)"
        class="form-select"
      >
        <option value="">Aucun objectif</option>
        <option
          v-for="objective in activeObjectives"
          :key="objective.id"
          :value="objective.id"
        >
          {{ objective.name }} ({{ formatCurrency(objective.currentAmount) }} / {{ formatCurrency(objective.targetAmount) }})
        </option>
      </select>
      <small class="form-hint">Si ce virement contribue à un objectif d'épargne</small>
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

    <!-- Message d'erreur de validation -->
    <div v-if="validationError" class="error-message">
      {{ validationError }}
    </div>

    <button type="submit" class="btn btn-primary btn-block" :disabled="loading || !!validationError">
      {{ loading ? 'Virement en cours...' : '🔄 Effectuer le virement' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import type { TransferDTO, Account, Objective } from '@/types'
import { useFormatters } from '@/composables/useFormatters'

const props = defineProps<{
  modelValue: TransferDTO
  accounts: Account[]
  activeObjectives: Objective[]
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TransferDTO]
  submit: []
}>()

const { formatCurrency } = useFormatters()

const updateField = (field: keyof TransferDTO, value: any) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}

// Optimisation : Auto-sélectionner le compte destination quand on choisit un objectif
watch(() => props.modelValue.objectiveId, (newObjectiveId) => {
  if (newObjectiveId) {
    // Trouver l'objectif sélectionné
    const selectedObjective = props.activeObjectives.find(obj => obj.id === newObjectiveId)

    // Si l'objectif a un compte associé, l'assigner automatiquement comme destination
    if (selectedObjective?.accountId) {
      updateField('destinationAccountId', selectedObjective.accountId)
    }
  }
})

// Validation : Vérifier que le compte destination correspond au compte de l'objectif
const validationError = computed(() => {
  // Si aucun objectif sélectionné, pas de validation nécessaire
  if (!props.modelValue.objectiveId) return null

  // Trouver l'objectif sélectionné
  const objective = props.activeObjectives.find(obj => obj.id === props.modelValue.objectiveId)

  // Si l'objectif n'existe pas ou n'a pas de compte associé, validation OK
  if (!objective?.accountId) return null

  // Si l'objectif a un compte associé, il DOIT correspondre au compte destination
  if (objective.accountId !== props.modelValue.destinationAccountId) {
    const accountName = props.accounts.find(acc => acc.id === objective.accountId)?.name || 'compte associé'
    return `⚠️ Ce virement doit aller vers le compte "${accountName}" car il est associé à l'objectif sélectionné.`
  }

  return null
})

// Handler de soumission avec validation
const handleSubmit = () => {
  if (validationError.value) {
    return // Empêcher la soumission
  }
  emit('submit')
}
</script>

<style scoped>
.transaction-form {
  margin-top: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-row .form-group {
  margin-bottom: 12px;
}

.btn-block {
  width: 100%;
  margin-top: 8px;
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  font-style: italic;
}

.form-textarea {
  min-height: 189px;
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
  font-size: 14px;
  border: 1px solid #fecaca;
}
</style>
