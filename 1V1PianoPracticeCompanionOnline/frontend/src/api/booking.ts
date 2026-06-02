import request from '@/utils/request'
import type { TeacherFilterParams, Teacher, TimeSlot, Booking, DifficultyLevel } from '@/types'

interface TeacherListResponse {
  list: Teacher[]
  total: number
  page: number
  pageSize: number
}

export function getTeacherListApi(params: TeacherFilterParams): Promise<TeacherListResponse> {
  return request.get('/teachers', { params })
}

export function getTeacherDetailApi(teacherId: number): Promise<Teacher> {
  return request.get(`/teachers/${teacherId}`)
}

export function getTeacherTimeSlotsApi(teacherId: number, date: string): Promise<TimeSlot[]> {
  return request.get(`/teachers/${teacherId}/time-slots`, { params: { date } })
}

export interface CreateBookingRequest {
  teacherId: number
  timeSlotId: number
  sheetMusicId?: number
  notes?: string
}

export function createBookingApi(data: CreateBookingRequest): Promise<Booking> {
  return request.post('/bookings', data)
}

export function getBookingListApi(status?: string): Promise<Booking[]> {
  return request.get('/bookings', { params: status ? { status } : undefined })
}

export function getBookingDetailApi(bookingId: number): Promise<Booking> {
  return request.get(`/bookings/${bookingId}`)
}

export function cancelBookingApi(bookingId: number): Promise<Booking> {
  return request.put(`/bookings/${bookingId}/cancel`)
}

export function confirmBookingApi(bookingId: number): Promise<Booking> {
  return request.put(`/bookings/${bookingId}/confirm`)
}
