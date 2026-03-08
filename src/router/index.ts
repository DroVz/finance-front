import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true }
    },
    {
      path: '/',
      redirect: '/accueil'
    },
    {
      path: '/accueil',
      name: 'Accueil',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/ajouter',
      redirect: '/transactions'
    },
    {
      path: '/transactions',
      name: 'Transactions',
      component: () => import('@/views/TransactionsView.vue')
    },
    {
      path: '/comptes',
      name: 'Comptes',
      component: () => import('@/views/AccountsView.vue')
    },
    {
      path: '/cashflow',
      name: 'CashFlow',
      component: () => import('@/views/CashFlowView.vue')
    },
    {
      path: '/parametres',
      name: 'Parametres',
      component: () => import('@/views/SettingsView.vue')
    },
    {
      path: '/budget',
      name: 'Budget',
      component: () => import('@/views/BudgetView.vue')
    },
    {
      path: '/objectifs',
      name: 'Objectifs',
      component: () => import('@/views/ObjectivesView.vue')
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/AdminView.vue'),
      meta: { requiresAdmin: true }
    }
  ]
});

router.beforeEach(async (to) => {
  if (to.meta.public) return true;

  const authStore = useAuthStore();
  const authenticated = await authStore.checkAuth();

  if (!authenticated) {
    return { name: 'Login' };
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin()) {
    return { name: 'Accueil' };
  }
});

export default router;
