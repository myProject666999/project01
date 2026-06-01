export type UserRole = 'teacher' | 'parent';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  grade?: string;
  avatar?: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  grade?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TimeSlot {
  id: number;
  teacherId: number;
  teacher?: User;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'cancelled';
  duration: number;
  createdAt: string;
}

export interface TimeSlotCreate {
  date: string;
  startTime: string;
  endTime: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress';

export interface Appointment {
  id: number;
  teacherId: number;
  parentId: number;
  timeSlotId: number;
  teacher?: User;
  parent?: User;
  timeSlot?: TimeSlot;
  status: AppointmentStatus;
  subject: string;
  description: string;
  roomId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentCreate {
  timeSlotId: number;
  teacherId: number;
  subject: string;
  description: string;
}

export interface RoomToken {
  token: string;
  roomId: string;
  appointmentId: number;
  expiresAt: string;
}

export interface MeetingSummary {
  id: number;
  appointmentId: number;
  appointment?: Appointment;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: number;
  appointmentId: number;
  appointment?: Appointment;
  score: number;
  comment: string;
  createdAt: string;
}

export interface RatingCreate {
  appointmentId: number;
  score: number;
  comment: string;
}

export interface MeetingSummaryCreate {
  appointmentId: number;
  content: string;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  roomId?: string;
  senderId?: number;
  timestamp?: string;
}

export interface SignalData {
  type: 'offer' | 'answer' | 'ice-candidate';
  sdp?: any;
  candidate?: any;
  roomId: string;
  senderId: number;
  targetId: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}
