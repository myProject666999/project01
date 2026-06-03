import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi, getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  const isLoggedIn = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  function clearAuth() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  async function login(credentials) {
    try {
      const response = await loginApi(credentials)
      const data = response.data
      setToken(data.token)
      const userInfo = {
        ...data.user,
        name: data.user.realName,
        roleName: getRoleDisplayName(data.user.role)
      }
      setUserInfo(userInfo)
      return response
    } catch (error) {
      throw error
    }
  }

  function getRoleDisplayName(role) {
    const roleMap = {
      'ADMIN': '管理员',
      'APPRAISER': '鉴定人',
      'REVIEWER1': '一级复核人',
      'REVIEWER2': '二级复核人',
      'REVIEWER3': '三级复核人'
    }
    return roleMap[role] || role
  }

  async function fetchUserInfo() {
    try {
      const response = await getUserInfo()
      setUserInfo(response.data)
      return response
    } catch (error) {
      throw error
    }
  }

  async function logout() {
    try {
      await logoutApi()
    } finally {
      clearAuth()
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    fetchUserInfo,
    clearAuth,
    setToken,
    setUserInfo
  }
})
