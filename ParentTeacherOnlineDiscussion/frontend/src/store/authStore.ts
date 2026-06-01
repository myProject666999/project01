import { create } from 'zustand';
import type { User, UserRole } from '../types';
import { authAPI } from '../api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  login: (username: string, password: string, role: UserRole) => Promise<void>;
  register: (data: {
    username: string;
    password: string;
    role: UserRole;
    name: string;
    email: string;
    phone: string;
    subject?: string;
    grade?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (username, password, role) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login({ username, password, role });
      if (response.code === 200) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({
          user,
          token,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({ error: response.message, loading: false });
        throw new Error(response.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || '登录失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.register(data);
      if (response.code === 200) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({
          user,
          token,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({ error: response.message, loading: false });
        throw new Error(response.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || '注册失败';
      set({ error: message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  fetchCurrentUser: async () => {
    set({ loading: true });
    try {
      const response = await authAPI.getCurrentUser();
      if (response.code === 200) {
        const user = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        set({
          user,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
