import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== undefined && res.code !== 200) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 3000
      })
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error) => {
    const userStore = useUserStore()
    const status = error.response?.status

    if (status === 401) {
      ElMessageBox.confirm(
        '登录状态已过期，请重新登录',
        '系统提示',
        {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        userStore.clearAuth()
        router.push('/login')
      })
    } else if (status === 403) {
      ElMessage({
        message: '没有权限访问',
        type: 'error',
        duration: 3000
      })
    } else if (status === 404) {
      ElMessage({
        message: '请求的资源不存在',
        type: 'error',
        duration: 3000
      })
    } else if (status === 500) {
      ElMessage({
        message: error.response?.data?.message || '服务器内部错误',
        type: 'error',
        duration: 3000
      })
    } else {
      ElMessage({
        message: error.message || '网络错误',
        type: 'error',
        duration: 3000
      })
    }

    return Promise.reject(error)
  }
)

export default request
