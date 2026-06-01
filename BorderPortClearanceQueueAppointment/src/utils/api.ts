import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:9090',
  timeout: 10000,
})

http.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 200) {
      return res.data
    }
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    return Promise.reject(error)
  }
)

export interface PortDTO {
  id: number
  name: string
  code: string
  latitude: number
  longitude: number
  radius: number
  status: string
  cargoLaneCount: number
  passengerLaneCount: number
  currentCongestionLevel: string
}

export interface QuotaDTO {
  id: number
  portId: number
  laneId: number
  vehicleType: string
  quotaDate: string
  timeSlot: string
  baseQuota: number
  adjustedQuota: number
  usedCount: number
  remaining: number
}

export interface AppointmentDTO {
  id: number
  appointmentNo: string
  portId: number
  portName: string
  quotaId: number
  vehicleType: string
  plateNumber: string
  driverName: string
  driverPhone: string
  appointmentDate: string
  timeSlot: string
  qrCode: string
  status: string
  checkinLatitude: number | null
  checkinLongitude: number | null
  checkinTime: string | null
}

export interface AppointmentCreateDTO {
  portId: number
  vehicleType: string
  plateNumber: string
  driverName: string
  driverPhone: string
  appointmentDate: string
  timeSlot: string
}

export interface CheckInDTO {
  appointmentNo: string
  plateNumber: string
  latitude: number
  longitude: number
}

export interface LaneQueueDTO {
  laneId: number
  laneName: string
  laneType: string
  status: string
  waitingCount: number
}

export interface QueueInfoDTO {
  portId: number
  portName: string
  waitingCount: number
  processingCount: number
  estimatedWaitMinutes: number
  lanes: LaneQueueDTO[]
}

export const getPorts = () => http.get<any, PortDTO[]>('/api/ports')

export const getPortById = (id: number) => http.get<any, PortDTO>(`/api/ports/${id}`)

export const getQuotas = (portId: number, vehicleType: string, date: string) =>
  http.get<any, QuotaDTO[]>('/api/appointments/quotas', { params: { portId, vehicleType, date } })

export const createAppointment = (data: AppointmentCreateDTO) =>
  http.post<any, AppointmentDTO>('/api/appointments', data)

export const getAppointment = (id: number) => http.get<any, AppointmentDTO>(`/api/appointments/${id}`)

export const cancelAppointment = (id: number) => http.delete<any, void>(`/api/appointments/${id}`)

export const getAppointmentsByPhone = (phone: string) =>
  http.get<any, AppointmentDTO[]>(`/api/appointments/phone/${phone}`)

export const checkIn = (data: CheckInDTO) => http.post<any, AppointmentDTO>('/api/appointments/check-in', data)

export const getQueueInfo = (portId: number) => http.get<any, QueueInfoDTO>(`/api/queue/${portId}`)
