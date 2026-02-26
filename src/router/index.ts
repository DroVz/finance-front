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
      redirect: '/ajouter'
    },
    {
      path: '/ajouter',
      name: 'Ajouter',
      component: () => import('@/views/AddTransactionView.vue')
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
});

export default router;
