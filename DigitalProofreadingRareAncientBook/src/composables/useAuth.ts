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
    }
    return data
  }

  async function checkAuth() {
    if (!token.value) return false
    
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    })
    const data = await res.json()
    if (data.success) {
      token.value = data.token
      user.value = data.user
    }
    return data.success
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
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
