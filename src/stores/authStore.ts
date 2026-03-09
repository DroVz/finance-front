import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authService } from '@/services/authService';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const checked = ref(false);
  const username = ref<string>('');
  const role = ref<string>('');

  const checkAuth = async (): Promise<boolean> => {
    if (checked.value) return isAuthenticated.value;
    try {
      const user = await authService.getMe();
      username.value = user.username;
      role.value = user.role;
      isAuthenticated.value = true;
    } catch {
      isAuthenticated.value = false;
    }
    checked.value = true;
    return isAuthenticated.value;
  };

  const login = async (loginUsername: string, password: string): Promise<void> => {
    await authService.login(loginUsername, password);
    // Récupérer le rôle après login
    const user = await authService.getMe();
    username.value = user.username;
    role.value = user.role;
    isAuthenticated.value = true;
    checked.value = true;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    isAuthenticated.value = false;
    checked.value = false;
    username.value = '';
    role.value = '';
  };

  const isAdmin = () => role.value === 'ROLE_ADMIN';

  return { isAuthenticated, checked, username, role, checkAuth, login, logout, isAdmin };
});
