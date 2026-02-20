<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#2563eb"/>
            <path d="M10 12h12M10 16h12M10 20h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <h1>Finance Manager</h1>
        </div>
        <p class="tagline">Gérez vos finances personnelles</p>

        <label
          class="theme-toggle"
          :title="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
        >
          <span class="toggle-icon">☀️</span>
          <span class="toggle-track" :class="{ active: isDark }" @click="toggleTheme">
            <span class="toggle-thumb"></span>
          </span>
          <span class="toggle-icon">🌙</span>
        </label>
      </div>

      <nav class="nav">
        <RouterLink to="/ajouter" class="nav-link">
          <span class="nav-icon">➕</span>
          Ajouter
        </RouterLink>
        <RouterLink to="/comptes" class="nav-link">
          <span class="nav-icon">💳</span>
          Comptes
        </RouterLink>
        <RouterLink to="/cashflow" class="nav-link">
          <span class="nav-icon">📊</span>
          Cash Flow
        </RouterLink>
        <RouterLink to="/budget" class="nav-link">
          <span class="nav-icon">🎯</span>
          Budget
        </RouterLink>
        <RouterLink to="/objectifs" class="nav-link">
          <span class="nav-icon">🏆</span>
          Objectifs
        </RouterLink>
        <RouterLink to="/parametres" class="nav-link">
          <span class="nav-icon">⚙️</span>
          Paramètres
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow);
  transition: background-color 0.2s;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.tagline {
  font-size: 14px;
  color: var(--text-secondary);
}

/* Toggle slider */
.theme-toggle {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.toggle-icon {
  font-size: 16px;
  line-height: 1;
}

.toggle-track {
  position: relative;
  width: 44px;
  height: 24px;
  background: var(--bg-hover);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: background 0.25s, border-color 0.25s;
  cursor: pointer;
  flex-shrink: 0;
}

.toggle-track.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s;
}

.toggle-track.active .toggle-thumb {
  transform: translateX(20px);
}

.nav {
  display: flex;
  gap: 8px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  background: var(--bg-light);
  color: var(--text-primary);
}

.nav-link.router-link-active {
  background: var(--primary-color);
  color: white;
}

.nav-icon {
  font-size: 18px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .theme-toggle {
    margin-left: 0;
  }

  .nav {
    overflow-x: auto;
    width: 100%;
  }

  .nav-link {
    white-space: nowrap;
  }
}
</style>
