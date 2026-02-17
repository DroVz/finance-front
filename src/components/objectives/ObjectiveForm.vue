<template>
  <div class="objective-form">
    <h3 class="form-title">Créer un objectif d'épargne</h3>

    <!-- Message si limite atteinte -->
    <div v-if="limitReached" class="alert alert-danger">
      <p><strong>⚠️ Limite atteinte</strong></p>
      <p>Vous avez déjà {{ activeCount?.active_count }} objectifs actifs. Maximum 5 autorisés.</p>
      <p>Supprimez un objectif existant pour en créer un nouveau.</p>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <!-- Compteur d'objectifs -->
      <div v-if="activeCount" class="objectives-counter">
        {{ activeCount.active_count }}/{{ activeCount.limit }} objectifs actifs
      </div>

      <!-- Nom de l'objectif -->
      <div class="form-group">
        <label class="form-label">
          Nom de l'objectif <span class="required">*</span>
        </label>
        <input
          v-model="formData.name"
          type="text"
          class="form-input"
          placeholder="Ex: Vacances été 2026, Nouvelle voiture"
          @blur="validateField('name')"
          :class="{ 'error': errors.name }"
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <!-- Montant cible -->
      <div class="form-group">
        <label class="form-label">
          Montant cible <span class="required">*</span>
        </label>
        <input
          v-model.number="formData.targetAmount"
          type="number"
          step="0.01"
          class="form-input"
          placeholder="0.00"
          @blur="validateField('targetAmount')"
          @input="calculateEffort"
          :class="{ 'error': errors.targetAmount }"
        />
        <span v-if="errors.targetAmount" class="error-message">{{ errors.targetAmount }}</span>
      </div>

      <!-- Date limite -->
      <div class="form-group">
        <div class="checkbox-wrapper">
          <input
            v-model="hasDeadline"
            type="checkbox"
            id="has-deadline"
            @change="toggleDeadline"
          />
          <label for="has-deadline">Définir une date limite</label>
        </div>

        <input
          v-if="hasDeadline"
          v-model="formData.targetDate"
          type="date"
          class="form-input"
          :min="minDate"
          @blur="validateField('targetDate')"
          @change="calculateEffort"
          :class="{ 'error': errors.targetDate }"
        />
        <span v-if="errors.targetDate" class="error-message">{{ errors.targetDate }}</span>

        <!-- Raccourcis de date -->
        <div v-if="hasDeadline" class="date-shortcuts">
          <button type="button" @click="setDateShortcut(3)">+3 mois</button>
          <button type="button" @click="setDateShortcut(6)">+6 mois</button>
          <button type="button" @click="setDateShortcut(12)">+1 an</button>
        </div>
      </div>

      <!-- Compte associé -->
      <div class="form-group">
        <label class="form-label">Compte associé (optionnel)</label>
        <select v-model="formData.accountId" class="form-select">
          <option :value="null">Aucun compte spécifique</option>
          <option
            v-for="account in accounts"
            :key="account.id"
            :value="account.id"
          >
            {{ account.name }}
          </option>
        </select>
        <small class="form-hint">
          💡 Si vous associez un compte, la progression sera calculée automatiquement
        </small>
      </div>

      <!-- Affichage de l'effort mensuel -->
      <div v-if="monthlyEffort" class="effort-display">
        <div class="effort-card">
          <p class="effort-main">
            💰 Pour atteindre {{ formatCurrency(formData.targetAmount) }} d'ici le
            {{ formatDate(formData.targetDate!) }}, il faudra épargner
            <strong>~{{ formatCurrency(monthlyEffort) }}/mois</strong>
          </p>
          <p class="effort-time">⏱️ Il reste {{ monthsRemaining }} mois</p>
        </div>
      </div>

      <!-- Indicateur de faisabilité -->
      <div v-if="feasibility" class="feasibility-indicator" :class="`feasibility-${feasibility.level}`">
        <span class="feasibility-icon">{{ feasibility.icon }}</span>
        <span class="feasibility-message">{{ feasibility.message }}</span>
      </div>

      <!-- Message si pas de date -->
      <div v-if="!hasDeadline && formData.targetAmount > 0" class="no-deadline-message">
        <p>💡 Épargnez à votre rythme !</p>
        <p v-if="financialStats?.hasSufficientHistory && estimatedMonths">
          À votre rythme actuel (~{{ formatCurrency(financialStats.averageMonthlySavings) }}/mois),
          vous atteindrez cet objectif en {{ estimatedMonths }} mois
        </p>
      </div>

      <!-- Message si pas d'historique -->
      <div v-if="!financialStats?.hasSufficientHistory && hasDeadline" class="info-message">
        💡 Après 2 mois d'utilisation, vous recevrez des recommandations personnalisées
      </div>

      <!-- Boutons -->
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="cancel">
          Annuler
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="hasErrors || submitting"
        >
          {{ submitting ? 'Création...' : 'Créer l\'objectif' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useObjectiveStore } from '@/stores/objectiveStore';
import { useAccountStore } from '@/stores/accountStore';
import { useFormatters } from '@/composables/useFormatters';
import type { ObjectiveDTO } from '@/types';

const emit = defineEmits<{
  close: [];
}>();

const router = useRouter();
const objectiveStore = useObjectiveStore();
const accountStore = useAccountStore();
const { formatCurrency, formatDate } = useFormatters();

const formData = ref<ObjectiveDTO>({
  name: '',
  targetAmount: 0,
  targetDate: null,
  accountId: null,
  category: null,
  description: null,
  priority: 3
});

const hasDeadline = ref(false);
const errors = ref<Record<string, string>>({});
const submitting = ref(false);

const activeCount = computed(() => objectiveStore.activeCount);
const financialStats = computed(() => objectiveStore.financialStats);
const accounts = computed(() => accountStore.accounts);
const limitReached = computed(() => (activeCount.value?.active_count ?? 0) >= 5);

// Date minimum (demain)
const minDate = computed(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
});

// Calcul de l'effort mensuel
const monthsRemaining = ref<number | null>(null);
const monthlyEffort = ref<number | null>(null);

const calculateEffort = () => {
  if (formData.value.targetAmount > 0 && formData.value.targetDate) {
    const today = new Date();
    const target = new Date(formData.value.targetDate);
    const daysRemaining = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    monthsRemaining.value = Math.ceil(daysRemaining / 30.44);

    if (monthsRemaining.value > 0) {
      monthlyEffort.value = formData.value.targetAmount / monthsRemaining.value;
    }
  } else {
    monthsRemaining.value = null;
    monthlyEffort.value = null;
  }

  calculateFeasibility();
};

// Estimation si pas de date
const estimatedMonths = computed(() => {
  if (financialStats.value && formData.value.targetAmount > 0) {
    const savings = financialStats.value.averageMonthlySavings;
    if (savings > 0) {
      return Math.ceil(formData.value.targetAmount / savings);
    }
  }
  return null;
});

// Indicateur de faisabilité
const feasibility = ref<{
  level: 'easy' | 'ambitious' | 'difficult';
  icon: string;
  message: string;
} | null>(null);

const calculateFeasibility = () => {
  if (!monthlyEffort.value || !financialStats.value?.hasSufficientHistory) {
    feasibility.value = null;
    return;
  }

  const ratio = monthlyEffort.value / financialStats.value.averageMonthlyIncome;

  if (ratio <= 0.30) {
    feasibility.value = {
      level: 'easy',
      icon: '✅',
      message: `Objectif réaliste ! Vous épargnez ${formatCurrency(financialStats.value.averageMonthlySavings)}/mois`
    };
  } else if (ratio <= 0.50) {
    feasibility.value = {
      level: 'ambitious',
      icon: '⚠️',
      message: `Objectif ambitieux. Il faudra ${formatCurrency(monthlyEffort.value)}/mois (vs ${formatCurrency(financialStats.value.averageMonthlySavings)}/mois actuellement)`
    };
  } else {
    const percentage = (ratio * 100).toFixed(0);
    feasibility.value = {
      level: 'difficult',
      icon: '🔴',
      message: `Attention : ${formatCurrency(monthlyEffort.value)}/mois nécessaires, soit ${percentage}% de vos revenus`
    };
  }
};

// Validation des champs
const validateField = (fieldName: string) => {
  switch (fieldName) {
    case 'name':
      if (!formData.value.name || formData.value.name.trim().length === 0) {
        errors.value.name = 'Veuillez donner un nom à votre objectif';
      } else if (formData.value.name.trim().length < 3) {
        errors.value.name = 'Le nom doit faire au moins 3 caractères';
      } else {
        delete errors.value.name;
      }
      break;

    case 'targetAmount':
      if (!formData.value.targetAmount || formData.value.targetAmount <= 0) {
        errors.value.targetAmount = 'Le montant doit être supérieur à 0€';
      } else {
        delete errors.value.targetAmount;
      }
      break;

    case 'targetDate':
      if (hasDeadline.value && formData.value.targetDate) {
        const targetDate = new Date(formData.value.targetDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (targetDate <= today) {
          errors.value.targetDate = 'La date limite doit être dans le futur';
        } else {
          delete errors.value.targetDate;
        }
      } else {
        delete errors.value.targetDate;
      }
      break;
  }
};

const hasErrors = computed(() => Object.keys(errors.value).length > 0);

// Gestion de la checkbox "Pas de date limite"
const toggleDeadline = () => {
  if (!hasDeadline.value) {
    formData.value.targetDate = null;
    delete errors.value.targetDate;
    monthlyEffort.value = null;
    monthsRemaining.value = null;
    feasibility.value = null;
  }
};

// Raccourcis de date
const setDateShortcut = (months: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  formData.value.targetDate = date.toISOString().split('T')[0];
  calculateEffort();
};

// Soumission du formulaire
const handleSubmit = async () => {
  // Valider tous les champs
  validateField('name');
  validateField('targetAmount');
  if (hasDeadline.value) {
    validateField('targetDate');
  }

  if (hasErrors.value) {
    return;
  }

  // Confirmation si montant > 100 000€
  if (formData.value.targetAmount > 100000) {
    const confirmed = confirm(
      `⚠️ Vous avez saisi ${formatCurrency(formData.value.targetAmount)}. Confirmez-vous ?`
    );
    if (!confirmed) {
      return;
    }
  }

  submitting.value = true;

  try {
    const objective = await objectiveStore.createObjective({
      ...formData.value,
      name: formData.value.name.trim()
    });

    // Notification succès
    alert(`✅ Objectif "${objective.name}" créé avec succès !\n\n🎯 Objectif : ${formatCurrency(objective.targetAmount)}\n${objective.targetDate ? `📅 Échéance : ${formatDate(objective.targetDate)}` : '💡 Épargnez à votre rythme !'}`);

    // Fermer le modal et rediriger
    emit('close');

    // Recharger les objectifs
    await objectiveStore.fetchObjectives();
  } catch (error: any) {
    alert(error.response?.data?.message || "Erreur lors de la création de l'objectif");
  } finally {
    submitting.value = false;
  }
};

const cancel = () => {
  emit('close');
};

// Chargement initial
onMounted(async () => {
  await Promise.all([
    objectiveStore.fetchActiveCount(),
    objectiveStore.fetchFinancialStats(),
    accountStore.fetchAccounts()
  ]);
});
</script>

<style scoped>
.objective-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
}

.objectives-counter {
  padding: 8px 16px;
  background: var(--bg-light);
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 500;
}

.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.alert-danger {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
}

.required {
  color: var(--danger-color);
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-input.error {
  border-color: var(--danger-color);
}

.error-message {
  display: block;
  color: var(--danger-color);
  font-size: 12px;
  margin-top: 4px;
}

.form-hint {
  display: block;
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 4px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.date-shortcuts {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.date-shortcuts button {
  padding: 4px 12px;
  background: var(--bg-light);
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.date-shortcuts button:hover {
  background: #e5e7eb;
}

.effort-display {
  margin: 20px 0;
}

.effort-card {
  padding: 16px;
  background: #dbeafe;
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.effort-main {
  font-size: 14px;
  margin-bottom: 8px;
}

.effort-time {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.feasibility-indicator {
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}

.feasibility-easy {
  background: #d1fae5;
  border-left: 4px solid var(--success-color);
}

.feasibility-ambitious {
  background: #fed7aa;
  border-left: 4px solid #f59e0b;
}

.feasibility-difficult {
  background: #fee2e2;
  border-left: 4px solid var(--danger-color);
}

.feasibility-icon {
  font-size: 20px;
}

.feasibility-message {
  font-size: 14px;
}

.no-deadline-message,
.info-message {
  padding: 12px 16px;
  background: var(--bg-light);
  border-radius: 8px;
  margin: 20px 0;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  flex: 1;
  transition: opacity 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-light);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .objective-form {
    padding: 16px;
  }

  .form-title {
    font-size: 20px;
  }

  .date-shortcuts {
    flex-wrap: wrap;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
