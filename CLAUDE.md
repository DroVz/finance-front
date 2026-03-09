# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Finance Manager is a personal finance app (multi-user). This repo is the **Vue 3 frontend**. The backend (Spring Boot REST API) lives in a separate repo and must run on `http://localhost:8080` for local development.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server with hot reload → http://localhost:5173
npm run build      # production build → dist/
```

Vite proxies `/api/*` to `http://localhost:8080` automatically — no manual CORS config needed in dev.

## Architecture

### Auth
Session-based (cookie `JSESSIONID`). Axios is configured with `withCredentials: true` in `src/services/api.ts`. The router guard in `src/router/index.ts` calls `authStore.checkAuth()` before every navigation. Routes with `meta: { public: true }` bypass the guard (only `/login`).

### State management pattern
One Pinia store per domain (`accountStore`, `categoryStore`, `transactionStore`, `budgetStore`, `cashFlowStore`, `objectiveStore`, `authStore`). Each store exposes `ref` state + async actions. **Every view must call the relevant `fetch*` actions in `onMounted`** — stores are empty on hard refresh, never assume data is pre-loaded.

### Data flow
`View` → calls store action → store calls `service` → service calls `api.ts` (Axios instance) → backend.

Services in `src/services/` are thin wrappers around Axios. Business logic lives in stores or views, not in services.

### Component structure
- `src/components/base/` — generic UI (LoadingSpinner, EmptyState, ConfirmModal, BudgetMonthSelector)
- `src/components/transaction/` — AddTransactionModal (wraps TypeSelector + TransactionForm/TransferForm), opened via FAB in App.vue
- Feature-specific components are colocated in their subdirectory (cashflow/, budget/, etc.)

### FAB pattern
The "+" button is in `App.vue` (fixed position, z-index 200). It controls `showAddModal` which opens `AddTransactionModal`. This modal is available on all pages — do not add transaction creation logic to individual views.

### Month selector
`BudgetMonthSelector` (in `src/components/base/`) uses `YYYY-MM` string format as v-model. Used in TransactionsView, CashFlowView, BudgetView. Apply `:deep(.month-selector) { margin-bottom: 0 }` in consuming views to avoid double spacing with parent gaps.

### Category types
Categories have a `type`: `CHARGES`, `LOISIRS`, or `REVENUS`. The `defaultCategory` (system category "Non attribué") has `type: null`. Filter logic in TransactionsView: selecting a type pill resets categoryId to null; selecting a category auto-sets its type pill.

## Key rules

**Reactivity:** Values derived from props or store state MUST be `computed()`. Plain `const` assignments in `<script setup>` execute once and never update.

**Data fetching:** Use `Promise.all([store.fetchA(), store.fetchB()])` in `onMounted` for parallel fetches.

**CSS scoping:** Use `:deep()` to override child component styles. Scoped styles cannot reach child component internals otherwise.

**No @CrossOrigin:** CORS is handled globally by the backend's `CorsConfig`. Do not add CORS headers on the frontend side.

## Deployment

```bash
python ../scripts/deploy.py   # uploads src/ to NAS and rebuilds Docker containers
```

NAS: `192.168.1.23:1222`, user `sshAlex`, app at `/srv/docker/finance/`. Uses `docker compose` (v2).
