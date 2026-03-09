<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#2563eb"/>
          <path d="M10 12h12M10 16h12M10 20h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <h1>Finance Manager</h1>
      </div>

      <p class="login-subtitle">Connectez-vous pour accéder à vos finances</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Identifiant</label>
          <input
            v-model="username"
            type="text"
            class="form-input"
            placeholder="Votre identifiant"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Votre mot de passe"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const handleLogin = async () => {
  loading.value = true
  error.value = null
  try {
    await authStore.login(username.value, password.value)
    router.push('/')
  } catch {
    error.value = 'Identifiants incorrects. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-light);
  padding: 24px;
}

.login-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
}

.login-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.login-logo h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.login-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.btn-full {
  width: 100%;
  margin-top: 8px;
}
</style>
