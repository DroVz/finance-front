# Finance Manager — Frontend

Interface utilisateur pour l'application de gestion de finances personnelles.

## Vue d'ensemble

Le frontend consomme l'API REST du backend pour afficher les comptes, transactions, budgets et objectifs d'épargne de l'utilisateur connecté. L'authentification est gérée via cookie de session (pas de JWT).

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| Vue 3 | — | Framework UI (Composition API + `<script setup>`) |
| TypeScript | — | Typage statique |
| Vite | — | Build tool et serveur de développement |
| Pinia | — | State management |
| Vue Router | — | Navigation |
| Axios | — | Appels HTTP |
| ApexCharts | — | Graphiques |

## Structure du projet

```
src/
├── assets/          # CSS global (variables, reset, thème clair/sombre)
├── components/      # Composants réutilisables
│   ├── base/        # Composants génériques (LoadingSpinner, EmptyState, ConfirmModal...)
│   ├── accounts/    # AccountCard, AccountItem
│   ├── budget/      # BudgetRuleCard, BudgetStreakCard
│   ├── cashflow/    # CashFlowChart, CashFlowSummary, CategoryBreakdown
│   ├── home/        # OnboardingChecklist, KPI cards
│   ├── import/      # CsvImportModal
│   ├── objectives/  # ObjectiveCard
│   ├── settings/    # CategoryCard, ColorPicker
│   └── transaction/ # AddTransactionModal, TransactionForm, TransferForm, TypeSelector
├── views/           # Pages (une par route)
│   ├── LoginView.vue
│   ├── HomeView.vue          # Dashboard (KPIs, checklist, résumé)
│   ├── AccountsView.vue      # Gestion des comptes
│   ├── TransactionsView.vue  # Liste et filtres des transactions
│   ├── CashFlowView.vue      # Analyse mensuelle du cash flow
│   ├── BudgetView.vue        # Règles budgétaires et suivi
│   ├── ObjectivesView.vue    # Objectifs d'épargne
│   ├── SettingsView.vue      # Catégories et mot de passe
│   └── AdminView.vue         # Gestion des utilisateurs (ROLE_ADMIN)
├── stores/          # Stores Pinia (un par domaine)
│   ├── authStore.ts
│   ├── accountStore.ts
│   ├── transactionStore.ts
│   ├── categoryStore.ts
│   ├── budgetStore.ts
│   ├── cashFlowStore.ts
│   └── objectiveStore.ts
├── services/        # Appels API (un fichier par ressource)
│   ├── api.ts                # Instance Axios configurée (baseURL, withCredentials)
│   ├── authService.ts
│   ├── accountService.ts
│   ├── transactionService.ts
│   ├── categoryService.ts
│   ├── cashFlowService.ts
│   ├── budgetService.ts
│   ├── objectiveService.ts
│   └── profileService.ts
├── router/
│   └── index.ts              # Routes + garde de navigation (redirect si non connecté)
├── types/
│   └── index.ts              # Toutes les interfaces TypeScript
├── App.vue                   # Racine : layout, FAB, AddTransactionModal
└── main.ts
```

## Lancement en local

### Prérequis

- Node.js 22+
- Le backend doit tourner sur `http://localhost:8080`

### Installation et démarrage

```bash
npm install
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

### Commandes disponibles

```bash
npm run dev      # Serveur de développement avec hot reload
npm run build    # Build de production (dans dist/)
npm run preview  # Prévisualiser le build de production
```

## Fonctionnement général

### Authentification

La connexion se fait via `POST /api/auth/login`. Le backend retourne un cookie de session. Axios est configuré avec `withCredentials: true` pour l'envoyer automatiquement sur chaque requête.

La garde de navigation dans `router/index.ts` vérifie que l'utilisateur est connecté avant chaque changement de route.

### Pattern store

Chaque store suit le même pattern :

```typescript
// Exemple : accountStore.ts
const accounts = ref<Account[]>([])
const loading = ref(false)

const fetchAccounts = async () => { ... }
const createAccount = async (dto: AccountDTO) => { ... }
```

Les vues appellent `onMounted(() => store.fetch...)` et accèdent aux données via `store.accounts`.

### Ajouter une transaction

Le bouton **+** (FAB fixe en bas à droite) est disponible sur toutes les pages. Il ouvre `AddTransactionModal` qui contient le formulaire complet (dépense, revenu, virement, import CSV).

### Types de catégorie

Les catégories ont un type : `CHARGES`, `LOISIRS`, ou `REVENUS`. Ce type est utilisé pour les filtres dans la vue Transactions et les graphiques Cash Flow.

## Pages principales

| Route | Vue | Description |
|---|---|---|
| `/` | HomeView | Dashboard, KPIs du mois, checklist d'onboarding |
| `/comptes` | AccountsView | Gestion des comptes (CRUD, drag & drop) |
| `/transactions` | TransactionsView | Historique filtrable par mois, type, catégorie |
| `/cashflow` | CashFlowView | Graphique d'évolution + répartition par catégorie |
| `/budget` | BudgetView | Règles budgétaires et streak mensuel |
| `/objectifs` | ObjectivesView | Objectifs d'épargne avec progression |
| `/parametres` | SettingsView | Catégories personnelles + changement de mot de passe |
| `/admin` | AdminView | Gestion des utilisateurs (admin uniquement) |

## Thème

L'application supporte le mode clair et sombre via les variables CSS dans `src/assets/main.css`. Le thème suit automatiquement la préférence système (`prefers-color-scheme`).

## Troubleshooting

**Erreur CORS au démarrage**

Vérifier que le backend tourne bien sur le port 8080 et que `CORS` est configuré pour `http://localhost:5173`.

**`401 Unauthorized` sur toutes les requêtes**

La session a expiré ou l'utilisateur n'est pas connecté. Vider les cookies et se reconnecter.

**Dépendances corrompues**

```bash
rm -rf node_modules
npm install
```
