import axios from 'axios';
import { ApiResponse, PageData, User, Vehicle, InspectionCategory, InspectionItem, InspectionReport, InspectionResult, InspectionPhoto } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username: string, password: string): Promise<ApiResponse<{ token: string; userInfo: User }>> =>
    api.post('/auth/login', { username, password }),

  getCurrentUser: (): Promise<ApiResponse<User>> => api.get('/auth/me'),

  changePassword: (oldPassword: string, newPassword: string): Promise<ApiResponse> =>
    api.put('/auth/password', { oldPassword, newPassword }),
};

export const vehicleApi = {
  getList: (params?: { page?: number; pageSize?: number; keyword?: string }): Promise<ApiResponse<PageData<Vehicle>>> =>
    api.get('/vehicles', { params }),

  get: (id: number): Promise<ApiResponse<Vehicle>> => api.get(`/vehicles/${id}`),

  create: (data: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> => api.post('/vehicles', data),

  update: (id: number, data: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> =>
    api.put(`/vehicles/${id}`, data),

  delete: (id: number): Promise<ApiResponse> => api.delete(`/vehicles/${id}`),
};

export const inspectionApi = {
  getCategories: (): Promise<ApiResponse<InspectionCategory[]>> => api.get('/inspection/categories'),

  getItems: (categoryId?: number): Promise<ApiResponse<InspectionItem[]>> =>
    api.get('/inspection/items', { params: { categoryId } }),

  getItemsWithCategories: (): Promise<ApiResponse<{ category: InspectionCategory; items: InspectionItem[] }[]>> =>
    api.get('/inspection/items-with-categories'),
};

export const reportApi = {
  getList: (params?: { page?: number; pageSize?: number; status?: string; keyword?: string }): Promise<ApiResponse<PageData<InspectionReport>>> =>
    api.get('/reports', { params }),

  get: (id: number): Promise<ApiResponse<InspectionReport>> => api.get(`/reports/${id}`),

  getByShareToken: (token: string): Promise<ApiResponse<InspectionReport>> => api.get(`/share/${token}`),

  create: (data: { vehicleId: number; inspectionDate: string; mileage: number }): Promise<ApiResponse<InspectionReport>> =>
    api.post('/reports', data),

  saveResults: (reportId: number, results: Partial<InspectionResult>[]): Promise<ApiResponse> =>
    api.post(`/reports/${reportId}/results`, results),

  submit: (reportId: number): Promise<ApiResponse<InspectionReport>> =>
    api.post(`/reports/${reportId}/submit`),

  generateShareLink: (reportId: number): Promise<ApiResponse<{ shareUrl: string; shareToken: string; expireAt: string; expireDays: number }>> =>
    api.post(`/reports/${reportId}/share`),

  delete: (id: number): Promise<ApiResponse> => api.delete(`/reports/${id}`),
};

export const uploadApi = {
  uploadPhoto: (data: FormData): Promise<ApiResponse<InspectionPhoto>> =>
    api.post('/upload/photo', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deletePhoto: (id: number): Promise<ApiResponse> => api.delete(`/upload/photo/${id}`),
};

export default api;
