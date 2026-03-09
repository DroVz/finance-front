<template>
  <div class="home-view">

    <!-- Checklist d'onboarding -->
    <OnboardingChecklist
      v-if="!checklistDismissed"
      :steps="checklistSteps"
      @dismiss="dismissChecklist"
    />

    <!-- Loader global -->
    <LoadingSpinner v-if="loading" />

    <template v-else>
      <!-- Cartes de stats -->
      <div class="stats-grid">
        <!-- Solde total -->
        <div class="stat-card">
          <div class="stat-label">💳 Solde total</div>
          <div class="stat-value" :class="totalBalance >= 0 ? 'positive' : 'negative'">
            {{ formatCurrency(totalBalance) }}
          </div>
          <div class="stat-sub">{{ accountStore.accounts.length }} compte{{ accountStore.accounts.length !== 1 ? 's' : '' }}</div>
        </div>

        <!-- Cash Flow du mois -->
        <div class="stat-card">
          <div class="stat-label">📊 Cash Flow — {{ currentMonthLabel }}</div>
          <div
            v-if="cashFlowStore.stats"
            class="stat-value"
            :class="cashFlowStore.stats.cashFlow >= 0 ? 'positive' : 'negative'"
          >
            {{ formatCurrency(cashFlowStore.stats.cashFlow) }}
          </div>
          <div v-else class="stat-value muted">—</div>
          <div v-if="cashFlowStore.stats" class="stat-sub">
            {{ formatCurrency(cashFlowStore.stats.totalIncome) }} revenus ·
            {{ formatCurrency(cashFlowStore.stats.totalExpenses) }} dépenses
          </div>
        </div>

        <!-- Règles budgétaires -->
        <div class="stat-card" :class="{ 'alert-card': exceededRules.length > 0 }">
          <div class="stat-label">🎯 Budget — {{ currentMonthLabel }}</div>
          <div v-if="budgetStore.rules.length > 0">
            <div
              class="stat-value"
              :class="exceededRules.length > 0 ? 'negative' : 'positive'"
            >
              {{ exceededRules.length > 0 ? exceededRules.length + ' non respectée' + (exceededRules.length > 1 ? 's' : '') : 'Tout respecté' }}
            </div>
            <div class="stat-sub">{{ budgetStore.rules.length }} règle{{ budgetStore.rules.length !== 1 ? 's' : '' }} au total</div>
          </div>
          <div v-else class="stat-value muted">Aucune règle</div>
        </div>

        <!-- Objectifs actifs -->
        <div class="stat-card">
          <div class="stat-label">🏆 Objectifs actifs</div>
          <div class="stat-value neutral">{{ objectiveStore.activeObjectives.length }}</div>
          <div class="stat-sub">
            <template v-if="objectiveStore.activeObjectives.length > 0">
              Meilleur : {{ bestObjectiveProgress }}%
            </template>
            <template v-else>Aucun objectif défini</template>
          </div>
        </div>
      </div>

      <!-- Bandeau explicatif -->
      <div class="explainer-banner">
        <div class="explainer-content">
          <h2 class="explainer-title">Pilotez votre stratégie financière</h2>
          <p class="explainer-text">
            Finance Manager transforme vos données bancaires en une vision claire. Adoptez une gestion rigoureuse pour une sécurité durable et une croissance maîtrisée.
          </p>
          <div class="explainer-concepts">

            <div class="concept">
              <div class="concept-header">
                <span class="concept-icon">📊</span>
                <strong class="concept-title">1. Le Cash Flow : Votre indicateur de santé</strong>
              </div>
              <p class="concept-intro">Le Cash Flow est le solde réel de votre activité mensuelle — ce qu'il vous reste une fois toutes vos obligations payées.</p>
              <ul class="concept-details">
                <li><span class="detail-label">Le calcul :</span> <span class="formula">Revenus mensuels − Dépenses totales</span></li>
                <li><span class="detail-label">L'analyse :</span> Un Cash Flow positif génère de l'épargne. Un Cash Flow négatif indique que vous consommez votre capital.</li>
                <li><span class="detail-label">Le suivi :</span> L'application automatise ce calcul pour vous éviter toute surprise de fin de mois.</li>
              </ul>
            </div>

            <div class="concept">
              <div class="concept-header">
                <span class="concept-icon">🎯</span>
                <strong class="concept-title">2. Les Seuils Budgétaires : Votre garde-fou</strong>
              </div>
              <p class="concept-intro">Le budget n'est pas une restriction, c'est une répartition optimisée. En définissant des limites par catégorie, vous gardez le contrôle sur vos priorités réelles.</p>
              <ul class="concept-details">
                <li><span class="detail-label">La méthode :</span> Allouez un pourcentage cible de vos revenus (ex : 30 % pour le logement, 15 % pour les loisirs).</li>
                <li><span class="detail-label">Le contrôle :</span> Si une catégorie approche de son plafond, une alerte vous permet d'ajuster vos flux avant de dépasser votre limite.</li>
              </ul>
            </div>

            <div class="concept">
              <div class="concept-header">
                <span class="concept-icon">🏆</span>
                <strong class="concept-title">3. Les Objectifs d'Épargne : Votre capital de sécurité</strong>
              </div>
              <p class="concept-intro">L'épargne constitue votre protection contre l'imprévu et le financement de vos projets (fonds d'urgence, apport immobilier, investissements).</p>
              <ul class="concept-details">
                <li><span class="detail-label">La stratégie :</span> Définissez un montant cible et une échéance précise.</li>
                <li><span class="detail-label">La progression :</span> Finance Manager calcule l'effort mensuel nécessaire et affiche en temps réel votre avancement vers l'objectif.</li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      <!-- Corps : transactions récentes + objectifs -->
      <div class="body-grid">

        <!-- Transactions récentes -->
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">🕐 Dernières transactions</h3>
            <RouterLink to="/ajouter" class="section-link">Ajouter ›</RouterLink>
          </div>

          <div v-if="recentTransactions.length > 0" class="transactions-list">
            <div
              v-for="tx in recentTransactions"
              :key="tx.id"
              class="tx-row"
            >
              <div class="tx-info">
                <span class="tx-desc">{{ tx.description || tx.categoryName || '—' }}</span>
                <span class="tx-meta">{{ formatDate(tx.transactionDate) }} · {{ tx.accountName }}</span>
              </div>
              <div class="tx-right">
                <span
                  v-if="tx.categoryName"
                  class="tx-category"
                  :style="tx.categoryColor ? { background: tx.categoryColor + '33', color: tx.categoryColor } : {}"
                >{{ tx.categoryName }}</span>
                <span
                  class="tx-amount"
                  :class="{
                    'amount-income': tx.type === 'INCOME',
                    'amount-expense': tx.type === 'EXPENSE',
                    'amount-transfer': tx.type === 'TRANSFER'
                  }"
                >
                  {{ tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : '' }}{{ formatCurrency(tx.amount) }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="empty-section">
            <p>Aucune transaction pour le moment</p>
            <RouterLink to="/ajouter" class="btn btn-primary btn-sm">Ajouter ma première transaction</RouterLink>
          </div>
        </div>

        <!-- Objectifs actifs -->
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">🏆 Progression des objectifs</h3>
            <RouterLink to="/objectifs" class="section-link">Voir tout ›</RouterLink>
          </div>

          <div v-if="objectiveStore.activeObjectives.length > 0" class="objectives-list">
            <div
              v-for="obj in topObjectives"
              :key="obj.id"
              class="obj-row"
            >
              <div class="obj-header">
                <span class="obj-name">{{ obj.name }}</span>
                <span class="obj-percent">{{ Math.round(obj.progressPercentage) }}%</span>
              </div>
              <div class="obj-progress-track">
                <div
                  class="obj-progress-fill"
                  :style="{ width: Math.min(obj.progressPercentage, 100) + '%' }"
                  :class="obj.progressPercentage >= 100 ? 'fill-done' : 'fill-active'"
                ></div>
              </div>
              <div class="obj-amounts">
                <span>{{ formatCurrency(obj.currentAmount) }}</span>
                <span class="obj-target">{{ formatCurrency(obj.targetAmount) }}</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-section">
            <p>Aucun objectif actif</p>
            <RouterLink to="/objectifs" class="btn btn-primary btn-sm">Créer un objectif</RouterLink>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAccountStore } from '@/stores/accountStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useCashFlowStore } from '@/stores/cashFlowStore'
import { useBudgetStore } from '@/stores/budgetStore'
import { useObjectiveStore } from '@/stores/objectiveStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useAuthStore } from '@/stores/authStore'
import { useFormatters } from '@/composables/useFormatters'
import OnboardingChecklist from '@/components/home/OnboardingChecklist.vue'
import type { ChecklistStep } from '@/components/home/OnboardingChecklist.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'

const accountStore = useAccountStore()
const categoryStore = useCategoryStore()
const cashFlowStore = useCashFlowStore()
const budgetStore = useBudgetStore()
const objectiveStore = useObjectiveStore()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()
const { formatCurrency } = useFormatters()

const loading = ref(true)

// --- Mois courant ---
const now = new Date()
const currentMonthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
const endOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

// --- Onboarding (clé par utilisateur pour isoler entre comptes) ---
const onboardingKey = computed(() => `onboarding-dismissed-${authStore.username}`)
const checklistDismissed = ref(localStorage.getItem(`onboarding-dismissed-${authStore.username}`) === 'true')

const dismissChecklist = () => {
  localStorage.setItem(onboardingKey.value, 'true')
  checklistDismissed.value = true
}

const checklistSteps = computed<ChecklistStep[]>(() => [
  {
    id: 'accounts',
    label: 'Créer votre premier compte',
    description: 'Ajoutez un compte bancaire pour commencer',
    link: '/comptes',
    done: accountStore.accounts.length > 0
  },
  {
    id: 'categories',
    label: 'Personnaliser vos catégories',
    description: 'Créez vos propres catégories de dépenses et revenus',
    link: '/parametres',
    done: categoryStore.categories.some(c => !c.defaultCategory)
  },
  {
    id: 'transactions',
    label: 'Ajouter vos premières transactions',
    description: 'Saisissez ou importez vos relevés bancaires',
    link: '/transactions',
    done: accountStore.accounts.some(a => a.transactionCount > 0)
  },
  {
    id: 'budget',
    label: 'Définir des règles budgétaires',
    description: 'Paramétrez vos règles pour contrôler vos dépenses',
    link: '/budget',
    done: budgetStore.rules.length > 0
  },
  {
    id: 'objectives',
    label: "Fixer des objectifs d'épargne",
    description: 'Définissez des cibles financières à atteindre',
    link: '/objectifs',
    done: objectiveStore.objectives.length > 0
  }
])

// Auto-dismiss une fois toutes les étapes complètes (après chargement)
const allStepsDone = computed(() => !loading.value && checklistSteps.value.every(s => s.done))
watch(allStepsDone, (isDone) => {
  if (isDone && !checklistDismissed.value) dismissChecklist()
})

// --- Stats ---
const totalBalance = computed(() => accountStore.getTotalBalance())

const exceededRules = computed(() => budgetStore.rules.filter(r => r.status === 'EXCEEDED'))

const recentTransactions = computed(() => transactionStore.transactions.slice(0, 5))

const topObjectives = computed(() => objectiveStore.activeObjectives.slice(0, 3))

const bestObjectiveProgress = computed(() => {
  if (objectiveStore.activeObjectives.length === 0) return 0
  return Math.round(Math.max(...objectiveStore.activeObjectives.map(o => o.progressPercentage)))
})

// --- Formatters ---
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// --- Chargement ---
onMounted(async () => {
  await Promise.all([
    accountStore.fetchAccounts(),
    categoryStore.fetchCategories(),
    cashFlowStore.fetchStats(startOfMonth, endOfMonth, null),
    budgetStore.fetchRules(),
    objectiveStore.fetchActiveObjectives(),
    transactionStore.fetchTransactions()
  ])
  loading.value = false
})
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.alert-card {
  border-left: 4px solid var(--danger-color);
  background: var(--bg-danger-tint);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-sub {
  font-size: 12px;
  color: var(--text-secondary);
}

.positive { color: var(--success); }
.negative { color: var(--danger); }
.neutral  { color: var(--primary-color); }
.muted    { color: var(--text-secondary); }

/* Body grid */
.body-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.section-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-link {
  font-size: 13px;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.section-link:hover {
  text-decoration: underline;
}

/* Transactions */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tx-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}

.tx-row:hover {
  background: var(--bg-hover);
}

.tx-info {
  flex: 1;
  min-width: 0;
}

.tx-desc {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tx-meta {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 1px;
}

.tx-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 12px;
}

.tx-category {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.tx-amount {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.amount-income   { color: var(--success); }
.amount-expense  { color: var(--danger); }
.amount-transfer { color: var(--text-secondary); }

/* Objectives */
.objectives-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.obj-row {}

.obj-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.obj-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.obj-percent {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-color);
}

.obj-progress-track {
  height: 8px;
  background: var(--bg-hover);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.obj-progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.fill-active { background: var(--primary-color); }
.fill-done   { background: var(--success); }

.obj-amounts {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
}

.obj-target {
  font-weight: 500;
}

/* Bandeau explicatif */
.explainer-banner {
  display: flex;
  align-items: stretch;
  gap: 0;
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
  overflow: hidden;
}

.explainer-content {
  flex: 1;
  padding: 28px 32px;
}

.explainer-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.explainer-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
}

.explainer-concepts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.concept {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: 10px;
  border: 1px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
}

.concept-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.concept-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.concept-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
}

.concept-intro {
  font-size: 13px;
  color: var(--text-primary);
  opacity: 0.75;
  line-height: 1.65;
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.concept-details {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.concept-details li {
  font-size: 13px;
  color: var(--text-primary);
  opacity: 0.75;
  line-height: 1.55;
}

.detail-label {
  font-weight: 600;
  color: var(--primary-color);
  opacity: 1;
  margin-right: 4px;
}

.formula {
  display: inline-block;
  background: var(--bg-item);
  color: var(--text-primary);
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'SFMono-Regular', 'Consolas', monospace;
  letter-spacing: 0.2px;
  opacity: 1;
}

/* Empty state */
.empty-section {
  text-align: center;
  padding: 32px 20px;
  color: var(--text-secondary);
}

.empty-section p {
  margin-bottom: 12px;
  font-size: 14px;
  font-style: italic;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .body-grid {
    grid-template-columns: 1fr;
  }
  .explainer-concepts {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .explainer-content {
    padding: 20px;
  }
  .explainer-concepts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .home-view {
    padding: 16px;
  }
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .stat-value {
    font-size: 20px;
  }
}
</style>
