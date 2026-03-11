const isDark = ref(true)

export function useTheme() {
  function apply(dark: boolean) {
    isDark.value = dark
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', dark)
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    }
  }

  function toggle() {
    apply(!isDark.value)
  }

  function init() {
    if (import.meta.client) {
      const saved = localStorage.getItem('theme')
      apply(saved ? saved === 'dark' : true) // default: dark
    }
  }

  return { isDark, toggle, init }
}
