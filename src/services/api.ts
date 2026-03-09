import axios from 'axios';
import router from '@/router';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Session expirée ou non authentifié → redirection vers login
      router.push({ name: 'Login' });
    } else if (error.response) {
      console.error('Erreur API:', error.response.data);
    } else if (error.request) {
      console.error('Pas de réponse du serveur');
    } else {
      console.error('Erreur:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
