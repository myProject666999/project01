import request from './request.js'

export const authApi = {
  login: (data) => request.post('/auth/login', data),
  logout: () => request.post('/auth/logout'),
  register: (data) => request.post('/auth/register', data),
  changePassword: (data) => request.put('/auth/change-password', data),
  getUserById: (id) => request.get(`/auth/user/${id}`),
  listUsers: () => request.get('/auth/users'),
  createUser: (data) => request.post('/auth/user', data),
  updateUser: (id, data) => request.put(`/auth/user/${id}`, data),
  deleteUser: (id) => request.delete(`/auth/user/${id}`)
}

export const pilotApi = {
  list: () => request.get('/pilots'),
  getById: (id) => request.get(`/pilots/${id}`),
  create: (data) => request.post('/pilots', data),
  update: (id, data) => request.put(`/pilots/${id}`, data),
  delete: (id) => request.delete(`/pilots/${id}`),
  search: (params) => request.get('/pilots/search', { params }),
  getAvailable: () => request.get('/pilots/available')
}

export const pilotScheduleApi = {
  list: () => request.get('/pilot-schedules'),
  getById: (id) => request.get(`/pilot-schedules/${id}`),
  create: (data) => request.post('/pilot-schedules', data),
  update: (id, data) => request.put(`/pilot-schedules/${id}`, data),
  delete: (id) => request.delete(`/pilot-schedules/${id}`),
  getByPilotId: (pilotId) => request.get(`/pilot-schedules/pilot/${pilotId}`),
  getByDate: (date) => request.get(`/pilot-schedules/date/${date}`),
  checkSchedule: (data) => request.post('/pilot-schedules/check', data),
  findAvailablePilots: (params) => request.get('/pilot-schedules/available-pilots', { params }),
  recommendBestPilot: (params) => request.get('/pilot-schedules/recommend-pilot', { params }),
  checkPilotQualification: (params) => request.get('/pilot-schedules/check-qualification', { params })
}

export const pilotageAssignmentApi = {
  list: () => request.get('/pilotage-assignments'),
  getById: (id) => request.get(`/pilotage-assignments/${id}`),
  create: (data) => request.post('/pilotage-assignments', data),
  update: (id, data) => request.put(`/pilotage-assignments/${id}`, data),
  delete: (id) => request.delete(`/pilotage-assignments/${id}`),
  search: (params) => request.get('/pilotage-assignments/search', { params }),
  getByOrderId: (orderId) => request.get(`/pilotage-assignments/order/${orderId}`),
  getByPilotId: (pilotId) => request.get(`/pilotage-assignments/pilot/${pilotId}`),
  getByStatus: (status) => request.get(`/pilotage-assignments/status/${status}`),
  postponeAssignment: (data) => request.post('/pilotage-assignments/postpone', data),
  getByPlannedTimeRange: (params) => request.get('/pilotage-assignments/planned-time-range', { params })
}

export const pilotageBillingApi = {
  list: () => request.get('/pilotage-billings'),
  getById: (id) => request.get(`/pilotage-billings/${id}`),
  create: (data) => request.post('/pilotage-billings', data),
  update: (id, data) => request.put(`/pilotage-billings/${id}`, data),
  delete: (id) => request.delete(`/pilotage-billings/${id}`),
  search: (params) => request.get('/pilotage-billings/search', { params }),
  getByOrderId: (orderId) => request.get(`/pilotage-billings/order/${orderId}`),
  getByVesselId: (vesselId) => request.get(`/pilotage-billings/vessel/${vesselId}`),
  getByStatus: (status) => request.get(`/pilotage-billings/status/${status}`),
  calculateBilling: (data) => request.post('/pilotage-billings/calculate', data),
  generateBilling: (data) => request.post('/pilotage-billings/generate', data),
  calculateBaseFee: (params) => request.get('/pilotage-billings/calculate-base-fee', { params }),
  calculateTonnageFee: (params) => request.get('/pilotage-billings/calculate-tonnage-fee', { params }),
  calculateDistanceFee: (params) => request.get('/pilotage-billings/calculate-distance-fee', { params }),
  calculateSurcharges: (params) => request.get('/pilotage-billings/calculate-surcharges', { params })
}

export const pilotageCompletionApi = {
  list: () => request.get('/pilotage-completions'),
  getById: (id) => request.get(`/pilotage-completions/${id}`),
  create: (data) => request.post('/pilotage-completions', data),
  update: (id, data) => request.put(`/pilotage-completions/${id}`, data),
  delete: (id) => request.delete(`/pilotage-completions/${id}`),
  search: (params) => request.get('/pilotage-completions/search', { params }),
  getByAssignmentId: (assignmentId) => request.get(`/pilotage-completions/assignment/${assignmentId}`),
  getByStatus: (status) => request.get(`/pilotage-completions/status/${status}`),
  getByQuality: (quality) => request.get(`/pilotage-completions/quality/${quality}`)
}

export const pilotageOrderApi = {
  list: () => request.get('/pilotage-orders'),
  getById: (id) => request.get(`/pilotage-orders/${id}`),
  create: (data) => request.post('/pilotage-orders', data),
  update: (id, data) => request.put(`/pilotage-orders/${id}`, data),
  delete: (id) => request.delete(`/pilotage-orders/${id}`),
  search: (params) => request.get('/pilotage-orders/search', { params }),
  getByStatus: (status) => request.get(`/pilotage-orders/status/${status}`),
  getPendingOrders: () => request.get('/pilotage-orders/pending'),
  getByEtaRange: (params) => request.get('/pilotage-orders/eta-range', { params })
}

export const notificationApi = {
  list: () => request.get('/notifications'),
  getById: (id) => request.get(`/notifications/${id}`),
  create: (data) => request.post('/notifications', data),
  update: (id, data) => request.put(`/notifications/${id}`, data),
  delete: (id) => request.delete(`/notifications/${id}`),
  getByRecipient: (recipientType, recipientId) => request.get(`/notifications/recipient/${recipientType}/${recipientId}`),
  getUnreadByRecipient: (recipientType, recipientId) => request.get(`/notifications/unread/${recipientType}/${recipientId}`),
  getUnreadCount: (recipientType, recipientId) => request.get(`/notifications/unread-count/${recipientType}/${recipientId}`),
  markAsRead: (id) => request.put(`/notifications/mark-read/${id}`),
  markAllAsRead: (recipientType, recipientId) => request.put(`/notifications/mark-all-read/${recipientType}/${recipientId}`),
  getByType: (notificationType) => request.get(`/notifications/type/${notificationType}`),
  getByBusiness: (relatedBusinessType, relatedBusinessId) => request.get(`/notifications/business/${relatedBusinessType}/${relatedBusinessId}`)
}

export const tideApi = {
  list: () => request.get('/tides'),
  getById: (id) => request.get(`/tides/${id}`),
  create: (data) => request.post('/tides', data),
  update: (id, data) => request.put(`/tides/${id}`, data),
  delete: (id) => request.delete(`/tides/${id}`),
  getByDate: (date) => request.get(`/tides/date/${date}`),
  getByDateRange: (params) => request.get('/tides/date-range', { params }),
  matchTideWindows: (data) => request.post('/tides/match-window', data),
  findNearestAvailableWindow: (data) => request.post('/tides/nearest-window', data),
  checkTideSufficiency: (params) => request.get('/tides/check-sufficiency', { params })
}

export const tugApi = {
  list: () => request.get('/tugs'),
  getById: (id) => request.get(`/tugs/${id}`),
  create: (data) => request.post('/tugs', data),
  update: (id, data) => request.put(`/tugs/${id}`, data),
  delete: (id) => request.delete(`/tugs/${id}`),
  search: (params) => request.get('/tugs/search', { params }),
  getAvailable: () => request.get('/tugs/available')
}

export const vesselApi = {
  list: () => request.get('/vessels'),
  getById: (id) => request.get(`/vessels/${id}`),
  create: (data) => request.post('/vessels', data),
  update: (id, data) => request.put(`/vessels/${id}`, data),
  delete: (id) => request.delete(`/vessels/${id}`),
  search: (params) => request.get('/vessels/search', { params })
}
