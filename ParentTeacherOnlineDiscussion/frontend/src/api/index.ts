import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TimeSlot,
  TimeSlotCreate,
  Appointment,
  AppointmentCreate,
  RoomToken,
  MeetingSummary,
  MeetingSummaryCreate,
  Rating,
  RatingCreate,
  ApiResponse
} from '../types';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
    api.post('/auth/login', data),

  register: (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> =>
    api.post('/auth/register', data),

  logout: (): Promise<ApiResponse<void>> =>
    api.post('/auth/logout'),

  getCurrentUser: (): Promise<ApiResponse<User>> =>
    api.get('/auth/me'),
};

export const teacherAPI = {
  getTeachers: (subject?: string): Promise<ApiResponse<User[]>> =>
    api.get('/teachers', { params: { subject } }),

  getTeacherDetail: (id: number): Promise<ApiResponse<User>> =>
    api.get(`/teachers/${id}`),
};

export const timeSlotAPI = {
  getMySlots: (): Promise<ApiResponse<TimeSlot[]>> =>
    api.get('/time-slots/my'),

  getTeacherSlots: (teacherId: number, date?: string): Promise<ApiResponse<TimeSlot[]>> =>
    api.get(`/time-slots/teacher/${teacherId}`, { params: { date } }),

  createSlot: (data: TimeSlotCreate): Promise<ApiResponse<TimeSlot>> =>
    api.post('/time-slots', data),

  updateSlot: (id: number, data: Partial<TimeSlotCreate>): Promise<ApiResponse<TimeSlot>> =>
    api.put(`/time-slots/${id}`, data),

  deleteSlot: (id: number): Promise<ApiResponse<void>> =>
    api.delete(`/time-slots/${id}`),
};

export const appointmentAPI = {
  getMyAppointments: (status?: string): Promise<ApiResponse<Appointment[]>> =>
    api.get('/appointments/my', { params: { status } }),

  getAppointmentDetail: (id: number): Promise<ApiResponse<Appointment>> =>
    api.get(`/appointments/${id}`),

  createAppointment: (data: AppointmentCreate): Promise<ApiResponse<Appointment>> =>
    api.post('/appointments', data),

  updateAppointmentStatus: (id: number, status: string): Promise<ApiResponse<Appointment>> =>
    api.patch(`/appointments/${id}/status`, { status }),

  cancelAppointment: (id: number): Promise<ApiResponse<void>> =>
    api.delete(`/appointments/${id}`),
};

export const roomAPI = {
  getRoomToken: (appointmentId: number): Promise<ApiResponse<RoomToken>> =>
    api.post(`/rooms/token/${appointmentId}`),

  validateRoomToken: (token: string): Promise<ApiResponse<{ valid: boolean; appointment: Appointment }>> =>
    api.post('/rooms/validate', { token }),

  endRoom: (roomId: string): Promise<ApiResponse<void>> =>
    api.post(`/rooms/end/${roomId}`),
};

export const meetingSummaryAPI = {
  getSummaryByAppointment: (appointmentId: number): Promise<ApiResponse<MeetingSummary>> =>
    api.get(`/meeting-summaries/appointment/${appointmentId}`),

  createSummary: (data: MeetingSummaryCreate): Promise<ApiResponse<MeetingSummary>> =>
    api.post('/meeting-summaries', data),

  updateSummary: (id: number, content: string): Promise<ApiResponse<MeetingSummary>> =>
    api.put(`/meeting-summaries/${id}`, { content }),
};

export const ratingAPI = {
  getRatingByAppointment: (appointmentId: number): Promise<ApiResponse<Rating>> =>
    api.get(`/ratings/appointment/${appointmentId}`),

  createRating: (data: RatingCreate): Promise<ApiResponse<Rating>> =>
    api.post('/ratings', data),
};

export default api;
