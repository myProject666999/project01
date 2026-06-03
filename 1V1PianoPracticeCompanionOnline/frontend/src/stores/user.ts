import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { loginApi, registerApi, getCurrentUserApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isTeacher = computed(() => userInfo.value?.role === 'teacher')
  const isStudent = computed(() => userInfo.value?.role === 'student')

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info: User) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  async function login(email: string, password: string) {
    const res = await loginApi({ email, password })
    setToken(res.access_token || res.token)
    setUserInfo(res.user)
    return res
  }

  async function register(username: string, email: string, password: string, role: 'student' | 'teacher') {
    const res = await registerApi({ username, email, password, role })
    setToken(res.access_token || res.token)
    setUserInfo(res.user)
    return res
  }

  async function fetchCurrentUser() {
    const res = await getCurrentUserApi()
    setUserInfo(res)
    return res
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isTeacher,
    isStudent,
    setToken,
    setUserInfo,
    login,
    register,
    fetchCurrentUser,
    logout
  }
})
