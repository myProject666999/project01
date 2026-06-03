import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { http } from '@/utils/request';
import type { User, LoginRequest, LoginResponse } from '../../shared/types';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));

  const isLoggedIn = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role);

  async function login(credentials: LoginRequest) {
    const result = await http.post<LoginResponse>('/auth/login', credentials);
    if (result.success && result.data) {
      token.value = result.data.token;
      user.value = result.data.user;
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    return result;
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  function hasRole(...roles: string[]) {
    if (!user.value) return false;
    return roles.includes(user.value.role);
  }

  return {
    token,
    user,
    isLoggedIn,
    userRole,
    login,
    logout,
    hasRole,
  };
});
