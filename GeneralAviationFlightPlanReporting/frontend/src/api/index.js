import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const flightPlanApi = {
  getAll: () => api.get('/flight-plans'),
  getById: (id) => api.get(`/flight-plans/${id}`),
  getByPilot: (pilotId) => api.get(`/flight-plans/pilot/${pilotId}`),
  getByStatus: (status) => api.get(`/flight-plans/status/${status}`),
  create: (data) => api.post('/flight-plans', data),
  update: (id, data) => api.put(`/flight-plans/${id}`, data),
  submit: (id) => api.post(`/flight-plans/${id}/submit`),
  close: (id, actualDeparture, actualArrival) => 
    api.post(`/flight-plans/${id}/close?actualDeparture=${actualDeparture}&actualArrival=${actualArrival}`),
  delete: (id) => api.delete(`/flight-plans/${id}`)
}

export const approvalApi = {
  getByFlightPlan: (flightPlanId) => api.get(`/approvals/flight-plan/${flightPlanId}`),
  getPending: (approverUserId) => api.get(`/approvals/pending/${approverUserId}`),
  approve: (processId, data) => api.post(`/approvals/${processId}/approve`, data),
  reject: (processId, data) => api.post(`/approvals/${processId}/reject`, data)
}

export const weatherApi = {
  getByFlightPlan: (flightPlanId) => api.get(`/weather-briefings/flight-plan/${flightPlanId}`),
  getLatest: (flightPlanId) => api.get(`/weather-briefings/flight-plan/${flightPlanId}/latest`),
  generate: (flightPlanId) => api.post(`/weather-briefings/generate/${flightPlanId}`)
}

export const approvalConfigApi = {
  getAll: () => api.get('/approval-configs'),
  getByAirspaceType: (type) => api.get(`/approval-configs/airspace-type/${type}`),
  getByTypeAndLevel: (type, level) => api.get(`/approval-configs/airspace-type/${type}/level/${level}`),
  create: (data) => api.post('/approval-configs', data),
  update: (id, data) => api.put(`/approval-configs/${id}`, data),
  delete: (id) => api.delete(`/approval-configs/${id}`)
}

export const pilotApi = {
  getAll: () => api.get('/pilots'),
  getById: (id) => api.get(`/pilots/${id}`),
  getByUserId: (userId) => api.get(`/pilots/user/${userId}`),
  create: (data) => api.post('/pilots', data),
  update: (id, data) => api.put(`/pilots/${id}`, data)
}

export const aircraftApi = {
  getAll: () => api.get('/aircrafts'),
  getById: (id) => api.get(`/aircrafts/${id}`),
  getByStatus: (status) => api.get(`/aircrafts/status/${status}`),
  create: (data) => api.post('/aircrafts', data),
  update: (id, data) => api.put(`/aircrafts/${id}`, data)
}

export const airspaceApi = {
  getAll: () => api.get('/airspaces'),
  getById: (id) => api.get(`/airspaces/${id}`),
  getByType: (type) => api.get(`/airspaces/type/${type}`),
  create: (data) => api.post('/airspaces', data),
  update: (id, data) => api.put(`/airspaces/${id}`, data)
}

export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getByRole: (role) => api.get(`/users/role/${role}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data)
}

export default api
