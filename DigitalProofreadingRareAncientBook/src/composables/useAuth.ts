import { ref, computed } from 'vue'

export interface User {
  id: number
  username: string
  displayName: string
  role: 'admin' | 'proofreader' | 'reviewer'
}

const token = ref<string | null>(localStorage.getItem('auth_token'))
const user = ref<User | null>(null)

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isReviewer = computed(() => user.value?.role === 'reviewer' || user.value?.role === 'admin')
  const isProofreader = computed(() => user.value?.role === 'proofreader' || user.value?.role === 'admin')

  async function login(username: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (data.success) {
      token.value = data.token
      user.value = data.user
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
    }
    return data
  }

  async function checkAuth() {
    if (!token.value) return false

    try {
      const stored = localStorage.getItem('auth_user')
      if (stored) {
        user.value = JSON.parse(stored)
        return true
      }
    } catch {}

    return false
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  function authHeaders() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return {
    token,
    user,
    isLoggedIn,
    isAdmin,
    isReviewer,
    isProofreader,
    login,
    checkAuth,
    logout,
    authHeaders,
  }
}
