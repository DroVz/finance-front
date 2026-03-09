import axios from 'axios';

export interface AuthUser {
  username: string;
  role: string;
}

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

  getMe: async (): Promise<AuthUser> => {
    const response = await axios.get<AuthUser>('/api/auth/me');
    return response.data;
  }
};
