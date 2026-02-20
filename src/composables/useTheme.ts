import { ref } from 'vue'

const isDark = ref(localStorage.getItem('theme') === 'dark')

const applyTheme = (dark: boolean) => {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

// Applique le thème sauvegardé dès le chargement du module
applyTheme(isDark.value)

export const useTheme = () => {
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
  }

  return { isDark, toggleTheme }
}
