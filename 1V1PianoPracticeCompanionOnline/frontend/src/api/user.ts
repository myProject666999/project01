import request from '@/utils/request'
import type { LoginRequest, RegisterRequest, User, ApiResponse } from '@/types'

interface LoginResponse {
  token: string
  user: User
}

export function loginApi(data: LoginRequest): Promise<LoginResponse> {
  return request.post('/auth/login', data)
}

export function registerApi(data: RegisterRequest): Promise<LoginResponse> {
  return request.post('/auth/register', data)
}

export function getCurrentUserApi(): Promise<User> {
  return request.get('/auth/me')
}

export function updateUserApi(data: Partial<User>): Promise<User> {
  return request.put('/user/profile', data)
}

export function uploadAvatarApi(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData()
  formData.append('avatar', file)
  return request.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function logoutApi(): Promise<void> {
  return request.post('/auth/logout')
}
