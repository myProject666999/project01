import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, LoginResponse } from '@/types'
import { UserRole } from '@/types'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string>(localStorage.getItem('token') || '')
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === UserRole.ADMIN)
  const isCouple = computed(() => user.value?.role === UserRole.COUPLE)
  const isRetoucher = computed(() => user.value?.role === UserRole.RETOUCHER)

  const login = async (credentials: LoginRequest) => {
    loading.value = true
    try {
      const response = await request.post<LoginResponse>('/auth/login', credentials)
      token.value = response.accessToken
      user.value = response.user
      localStorage.setItem('token', response.accessToken)
      localStorage.setItem('user', JSON.stringify(response.user))
      ElMessage.success('登录成功')
      return true
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '登录失败')
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    ElMessage.success('已退出登录')
  }

  const loadUserFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser)
        token.value = storedToken
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }

  const getCurrentUser = async () => {
    try {
      const response = await request.get<User>('/auth/profile')
      user.value = response
      localStorage.setItem('user', JSON.stringify(response))
    } catch (error) {
      logout()
    }
  }

  return {
    user,
    token,
    loading,
    isLoggedIn,
    isAdmin,
    isCouple,
    isRetoucher,
    login,
    logout,
    loadUserFromStorage,
    getCurrentUser
  }
})
