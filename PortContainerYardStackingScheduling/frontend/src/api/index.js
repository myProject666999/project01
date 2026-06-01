import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export function getZones() {
  return api.get('/zones')
}

export function getPanorama() {
  return api.get('/panorama')
}

export function getBayDetail(zoneId, bay) {
  return api.get(`/bay/${zoneId}/${bay}`)
}

export function containerIn(data) {
  return api.post('/container/in', data)
}

export function containerOut(data) {
  return api.post('/container/out', data)
}

export function recommendSlot(data) {
  return api.post('/recommend', data)
}

export function getContainers(status) {
  return api.get('/containers', { params: { status } })
}

export function getContainer(no) {
  return api.get(`/container/${no}`)
}

export function createAppointment(data) {
  return api.post('/appointment', data)
}

export function getAppointments(status) {
  return api.get('/appointments', { params: { status } })
}

export function updateAppointmentStatus(id, status) {
  return api.put(`/appointment/${id}/status`, { status })
}
