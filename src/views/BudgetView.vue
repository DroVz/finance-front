<template>
  <div class="budget-view">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Plan Budgétaire</h1>
        <p class="subtitle">Définissez vos règles budgétaires en % de vos revenus</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">+ Nouvelle règle</button>
    </div>

    <!-- Sélecteur de mois -->
    <BudgetMonthSelector
      v-model="selectedMonth"
      @update:modelValue="onMonthChange"
    />

    <!-- Carte revenus du mois -->
    <div class="income-card">
      <div class="income-icon">📈</div>
      <div>
        <div class="income-label">Revenus de {{ formattedSelectedMonth }}</div>
        <div class="income-value">{{ formatCurrency(budgetStore.monthlyIncome) }}</div>
        <div class="income-hint">Vos règles sont calculées sur cette base</div>
      </div>
    </div>

    <!-- Streak globale -->
    <BudgetStreakCard
      v-if="budgetStore.streak"
      :streak="budgetStore.streak"
    />

    <!-- Loader -->
    <LoadingSpinner v-if="budgetStore.loading" />

    <!-- Liste des règles -->
    <div v-else-if="budgetStore.rules.length > 0" class="rules-list">
      <BudgetRuleCard
        v-for="rule in budgetStore.rules"
        :key="rule.id"
        :rule="rule"
        :ruleStreak="rule.ruleStreak"
        @edit="openEditModal"
        @delete="handleDelete"
      />
    </div>

    <!-- Etat vide -->
    <EmptyState
      v-else
      message="Aucune règle budgétaire définie. Créez votre première règle !"
    />

    <!-- Guide -->
    <div class="guide-card">
      <h4 class="guide-title">💡 Guide des règles budgétaires</h4>
      <ul class="guide-list">
        <li><strong>Maximum</strong> : Pour les dépenses à ne pas dépasser (ex: Logement ≤ 30%)</li>
        <li><strong>Minimum</strong> : Pour l'épargne ou investissements à respecter (ex: Épargne ≥ 20%)</li>
        <li><strong>Objectif</strong> : Pour viser un pourcentage précis (ex: Loisirs = 10%)</li>
        <li>La règle populaire 50/30/20 : 50% besoins essentiels, 30% plaisirs, 20% épargne</li>
        <li>Ajustez vos règles selon votre situation et vos objectifs de vie</li>
      </ul>
    </div>

    <!-- Modal création / édition -->
    <BaseModal :show="showModal" @close="closeModal">
      <h3>{{ editingRule ? 'Modifier la règle' : 'Nouvelle règle budgétaire' }}</h3>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">Nom</label>
          <input
            v-model="formData.name"
            type="text"
            class="form-input"
            placeholder="Ex: Épargne, Loisirs, Logement..."
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Description (optionnel)</label>
          <input
            v-model="formData.description"
            type="text"
            class="form-input"
            placeholder="Ex: Epargne de précaution"
          />
        </div>

        <div class="form-row-modal">
          <div class="form-group">
            <label class="form-label">Type de règle</label>
            <select v-model="formData.ruleType" class="form-select" required>
              <option value="MAXIMUM">Maximum</option>
              <option value="MINIMUM">Minimum</option>
              <option value="TARGET">Objectif</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Pourcentage (%)</label>
            <input
              v-model.number="formData.percentage"
              type="number"
              min="1"
              max="100"
              step="1"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Catégorie (optionnel)</label>
          <select v-model="formData.categoryId" class="form-select">
            <option :value="null">Aucune (règle globale, ex: épargne)</option>
            <option
              v-for="cat in categoryStore.categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
          <p class="form-hint">Sans catégorie = calcul sur l'épargne (revenus - dépenses totales)</p>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn" @click="closeModal">Annuler</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ editingRule ? 'Enregistrer' : 'Créer' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <ConfirmModal
      :show="pendingDeleteRuleId !== null"
      title="Supprimer cette règle ?"
      message="Cette règle budgétaire sera définitivement supprimée."
      @confirm="doDeleteRule"
      @cancel="pendingDeleteRuleId = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBudgetStore } from '@/stores/budgetStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useFormatters } from '@/composables/useFormatters'
import type { BudgetRule, BudgetRuleDTO, BudgetRuleType } from '@/types'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import ConfirmModal from '@/components/base/ConfirmModal.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import BudgetRuleCard from '@/components/budget/BudgetRuleCard.vue'
import BudgetMonthSelector from '@/components/budget/BudgetMonthSelector.vue'
import BudgetStreakCard from '@/components/budget/BudgetStreakCard.vue'

const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()
const { formatCurrency } = useFormatters()

const selectedMonth = ref(budgetStore.selectedMonth)

const formattedSelectedMonth = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
})

const onMonthChange = async (month: string) => {
  await budgetStore.setSelectedMonth(month)
}

const showModal = ref(false)
const editingRule = ref<BudgetRule | null>(null)
const submitting = ref(false)

const formData = ref<BudgetRuleDTO>({
  name: '',
  description: null,
  ruleType: 'MAXIMUM' as BudgetRuleType,
  percentage: 20,
  categoryId: null
})

const resetForm = () => {
  formData.value = {
    name: '',
    description: null,
    ruleType: 'MAXIMUM',
    percentage: 20,
    categoryId: null
  }
  editingRule.value = null
}

const openCreateModal = () => {
  resetForm()
  showModal.value = true
}

const openEditModal = (rule: BudgetRule) => {
  editingRule.value = rule
  formData.value = {
    name: rule.name,
    description: rule.description,
    ruleType: rule.ruleType,
    percentage: rule.percentage,
    categoryId: rule.categoryId
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (editingRule.value) {
      await budgetStore.updateRule(editingRule.value.id, formData.value)
    } else {
      await budgetStore.createRule(formData.value)
    }
    closeModal()
  } catch {
    // erreur disponible dans budgetStore.error
  } finally {
    submitting.value = false
  }
}

const pendingDeleteRuleId = ref<number | null>(null);

const handleDelete = (id: number) => {
  pendingDeleteRuleId.value = id;
};

const doDeleteRule = async () => {
  if (pendingDeleteRuleId.value === null) return;
  try {
    await budgetStore.deleteRule(pendingDeleteRuleId.value);
  } catch {
    // erreur disponible dans budgetStore.error
  } finally {
    pendingDeleteRuleId.value = null;
  }
};

onMounted(async () => {
  await Promise.all([
    budgetStore.fetchRules(),
    budgetStore.fetchMonthlyIncome(),
    budgetStore.fetchStreak(),
    categoryStore.fetchCategories()
  ])
})
</script>

<style scoped>
.budget-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

/* Carte revenus */
.income-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  border-radius: var(--radius);
  color: white;
  margin-bottom: 24px;
}

.income-icon {
  font-size: 36px;
}

.income-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
  text-transform: capitalize;
}

.income-value {
  font-size: 28px;
  font-weight: 700;
}

.income-hint {
  font-size: 13px;
  opacity: 0.7;
  margin-top: 2px;
}

/* Liste des règles */
.rules-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

/* Guide */
.guide-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--warning-color);
}

.guide-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.guide-list {
  list-style: disc;
  padding-left: 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.guide-list li {
  margin-bottom: 8px;
}

/* Modal form */
.form-row-modal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .budget-view { padding: 16px; }
  .page-header { flex-direction: column; gap: 16px; }
  .page-header h1 { font-size: 24px; }
  .form-row-modal { grid-template-columns: 1fr; }
}
</style>
