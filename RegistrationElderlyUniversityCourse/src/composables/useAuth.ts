import { ref, computed } from 'vue'
import { post, get } from '@/lib/api'
import type { User } from '@/lib/types'
import router from '@/router'

const user = ref<User | null>(null)
const token = ref<string | null>(localStorage.getItem('token'))

const isLoggedIn = computed(() => !!token.value)

function setAuth(t: string, u: User) {
  token.value = t
  user.value = u
  localStorage.setItem('token', t)
  localStorage.setItem('user', JSON.stringify(u))
}

function clearAuth() {
  token.value = null
  user.value = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

async function login(phone: string, password: string) {
  const res = await post<{ token: string; user: User }>('/auth/login', { phone, password })
  if (res.code === 0) {
    setAuth(res.data.token, res.data.user)
  }
  return res
}

async function register(phone: string, password: string, name: string) {
  const res = await post<{ token: string; user: User }>('/auth/register', { phone, password, name })
  if (res.code === 0) {
    setAuth(res.data.token, res.data.user)
  }
  return res
}

function logout() {
  clearAuth()
  router.push('/login')
}

async function fetchProfile() {
  try {
    const res = await get<User>('/auth/profile')
    if (res.code === 0) {
      user.value = res.data
      localStorage.setItem('user', JSON.stringify(res.data))
    }
  } catch {
    clearAuth()
  }
}

function initAuth() {
  const savedUser = localStorage.getItem('user')
  if (savedUser && token.value) {
    try {
      user.value = JSON.parse(savedUser)
    } catch {
      clearAuth()
    }
  }
}

export function useAuth() {
  return {
    user,
    token,
    isLoggedIn,
    login,
    register,
    logout,
    fetchProfile,
    initAuth,
  }
}
