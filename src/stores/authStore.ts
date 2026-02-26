import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authService } from '@/services/authService';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const checked = ref(false);

  const checkAuth = async (): Promise<boolean> => {
    if (checked.value) return isAuthenticated.value;
    isAuthenticated.value = await authService.checkAuth();
    checked.value = true;
    return isAuthenticated.value;
  };

  const login = async (username: string, password: string): Promise<void> => {
    await authService.login(username, password);
    isAuthenticated.value = true;
    checked.value = true;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    isAuthenticated.value = false;
    checked.value = false;
  };

  return { isAuthenticated, checkAuth, login, logout };
});
