import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
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

export default router;
