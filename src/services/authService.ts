import axios from 'axios';

export const authService = {
  login: async (username: string, password: string): Promise<void> => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    await axios.post('/api/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },

  logout: async (): Promise<void> => {
    await axios.post('/api/auth/logout');
  },

  checkAuth: async (): Promise<boolean> => {
    try {
      await axios.get('/api/auth/me');
      return true;
    } catch {
      return false;
    }
  }
};
