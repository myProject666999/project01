import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Booking, TimeSlot, TeacherFilterParams } from '@/types'
import { getTeacherListApi, getTeacherTimeSlotsApi, createBookingApi, getBookingListApi } from '@/api/booking'

export const useBookingStore = defineStore('booking', () => {
  const teachers = ref<any[]>([])
  const timeSlots = ref<TimeSlot[]>([])
  const bookings = ref<Booking[]>([])
  const selectedTeacher = ref<any>(null)
  const selectedTimeSlot = ref<TimeSlot | null>(null)
  const total = ref(0)
  const loading = ref(false)

  async function fetchTeachers(params: TeacherFilterParams) {
    loading.value = true
    try {
      const res = await getTeacherListApi(params)
      teachers.value = res.list
      total.value = res.total
      return res
    } finally {
      loading.value = false
    }
  }

  async function fetchTimeSlots(teacherId: number, date: string) {
    loading.value = true
    try {
      const res = await getTeacherTimeSlotsApi(teacherId, date)
      timeSlots.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  async function createBooking(teacherId: number, timeSlotId: number, sheetMusicId?: number, notes?: string) {
    const res = await createBookingApi({ teacherId, timeSlotId, sheetMusicId, notes })
    return res
  }

  async function fetchBookings(status?: string) {
    loading.value = true
    try {
      const res = await getBookingListApi(status)
      bookings.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  function setSelectedTeacher(teacher: any) {
    selectedTeacher.value = teacher
  }

  function setSelectedTimeSlot(slot: TimeSlot | null) {
    selectedTimeSlot.value = slot
  }

  return {
    teachers,
    timeSlots,
    bookings,
    selectedTeacher,
    selectedTimeSlot,
    total,
    loading,
    fetchTeachers,
    fetchTimeSlots,
    createBooking,
    fetchBookings,
    setSelectedTeacher,
    setSelectedTimeSlot
  }
})
