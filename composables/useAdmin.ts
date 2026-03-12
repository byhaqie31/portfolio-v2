const adminKey = ref('')

export function useAdmin() {
  const isAuthenticated = computed(() => !!adminKey.value)

  function login(key: string) {
    adminKey.value = key
    if (import.meta.client) {
      sessionStorage.setItem('admin_key', key)
    }
  }

  function logout() {
    adminKey.value = ''
    if (import.meta.client) {
      sessionStorage.removeItem('admin_key')
    }
  }

  function restoreSession() {
    if (import.meta.client) {
      const stored = sessionStorage.getItem('admin_key')
      if (stored) adminKey.value = stored
    }
  }

  async function apiFetch<T = any>(url: string, options: any = {}): Promise<T> {
    return $fetch<T>(url, {
      ...options,
      headers: {
        ...options.headers,
        'x-admin-key': adminKey.value,
      },
    })
  }

  return { adminKey, isAuthenticated, login, logout, restoreSession, apiFetch }
}
