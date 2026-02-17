# Finance Manager - Frontend

Interface Vue 3 pour l'application de gestion de finances personnelles.

## 🏗️ Technologies

- **Vue 3** (Composition API)
- **TypeScript**
- **Vite** (build tool)
- **Pinia** (state management)
- **Vue Router** (routing)
- **Axios** (HTTP client)

## 📁 Structure du projet

```
src/
├── assets/          # Styles CSS globaux
├── components/      # Composants réutilisables
│   └── Header.vue   # En-tête avec navigation
├── views/           # Pages de l'application
│   ├── AddTransactionView.vue    # Ajout de transactions
│   ├── AccountsView.vue           # Vue des comptes et transactions
│   ├── CashFlowView.vue           # Analyse du cash flow
│   └── SettingsView.vue           # Gestion des comptes et catégories
├── services/        # Services API
│   ├── api.ts                  # Configuration Axios
│   ├── accountService.ts       # API comptes
│   ├── categoryService.ts      # API catégories
│   ├── transactionService.ts   # API transactions
│   └── dashboardService.ts     # API statistiques
├── stores/          # Stores Pinia
│   ├── accountStore.ts         # État des comptes
│   ├── categoryStore.ts        # État des catégories
│   └── transactionStore.ts     # État des transactions
├── types/           # Types TypeScript
│   └── index.ts     # Définitions des interfaces
├── router/          # Configuration du routeur
│   └── index.ts
├── App.vue          # Composant racine
└── main.ts          # Point d'entrée
```

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm 10+
- Le backend doit être lancé sur http://localhost:8080

### Étapes

```bash
# 1. Installer les dépendances
cd frontend
npm install

# 2. Lancer le serveur de développement
npm run dev

# L'application sera accessible sur http://localhost:5173
```

## 🎨 Pages de l'application

### 1. Ajouter (/ajouter)
- Formulaire pour créer des transactions (Dépense, Revenu, Virement)
- Sélection du type avec interface à onglets
- Validation des données avant soumission
- Bouton d'import CSV (fonctionnalité à venir)

### 2. Comptes (/comptes)
- 3 KPI cards (Solde total, Revenus, Dépenses)
- Vue des soldes par compte
- Filtres par compte et type
- Historique des transactions avec possibilité de suppression

### 3. Cash Flow (/cashflow)
- 4 métriques principales (Revenus, Dépenses, Solde net, Taux d'épargne)
- Placeholders pour graphiques d'évolution (à implémenter)
- Dépenses par catégorie avec barres de progression
- Revenus par catégorie avec barres de progression

### 4. Paramètres (/parametres)
- Gestion des comptes (CRUD)
- Gestion des catégories (CRUD)
- Modal d'édition de compte
- Info box avec conseils d'utilisation

## 🔧 Développement

### Commandes disponibles

```bash
# Développement avec hot-reload
npm run dev

# Build de production
npm run build

# Preview du build de production
npm run preview

# Vérification TypeScript
npm run build  # qui lance vue-tsc
```

### Architecture des stores

L'application utilise Pinia pour la gestion d'état. Chaque store gère :
- Les données (ref)
- Les états de chargement et d'erreur
- Les actions CRUD
- Les méthodes utilitaires

Exemple d'utilisation :
```typescript
import { useAccountStore } from '@/stores/accountStore';

const accountStore = useAccountStore();

// Charger les données
await accountStore.fetchAccounts();

// Accéder aux données
const accounts = accountStore.accounts;
const totalBalance = accountStore.getTotalBalance();
```

### Services API

Tous les appels API sont centralisés dans les services :

```typescript
import { accountService } from '@/services/accountService';

// Créer un compte
const account = await accountService.create({
  name: 'Compte Courant',
  initialBalance: 1000,
  currency: 'EUR'
});
```

## 🎨 Personnalisation des styles

Les variables CSS sont définies dans `src/assets/main.css` :

```css
:root {
  --primary-color: #2563eb;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  --bg-light: #f5f5f7;
  --border-color: #e5e7eb;
  /* ... */
}
```

## 📱 Responsive

L'application est responsive et s'adapte aux mobiles avec :
- Grilles adaptatives (`grid-template-columns: repeat(auto-fit, ...)`)
- Media queries pour les petits écrans
- Navigation horizontale scrollable sur mobile

## 🔒 Sécurité

- Validation des formulaires côté client
- Messages d'erreur clairs provenant du backend
- Confirmations avant suppression
- Pas de stockage de données sensibles en localStorage

## 🚧 Fonctionnalités à venir

### Import CSV
- Upload de fichier
- Mapping des colonnes
- Prévisualisation avec édition
- Complétion manuelle des champs manquants

### Graphiques
- Évolution mensuelle (Chart.js)
- Tendance du solde
- Diagrammes circulaires pour les catégories

### Améliorations UX
- Notifications toast
- Loading states plus élaborés
- Pagination pour les grandes listes
- Recherche et tri avancés

## 🐛 Troubleshooting

### Le backend ne répond pas
Vérifiez que :
1. Le backend est bien lancé sur le port 8080
2. CORS est configuré correctement côté backend
3. PostgreSQL est démarré

### Erreur de compilation TypeScript
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Hot reload ne fonctionne pas
```bash
# Relancer le serveur
npm run dev
```

## 📚 Ressources

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

*Frontend développé avec Vue 3 + TypeScript pour Finance Manager* 🚀
