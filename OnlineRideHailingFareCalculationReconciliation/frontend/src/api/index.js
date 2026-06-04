import request from '@/utils/request'

export const driverApi = {
  getList: () => request.get('/drivers'),
  getDetail: (id) => request.get(`/drivers/${id}`),
  create: (data) => request.post('/drivers', data),
  update: (id, data) => request.put(`/drivers/${id}`, data),
  delete: (id) => request.delete(`/drivers/${id}`)
}

export const tripApi = {
  getList: (params) => request.get('/trips', { params }),
  getDetail: (id) => request.get(`/trips/${id}`),
  create: (data) => request.post('/trips', data),
  complete: (id, data) => request.put(`/trips/${id}/complete`, data),
  getSummary: (driverId, date) => request.get(`/trips/summary/${driverId}/${date}`)
}

export const orderApi = {
  import: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/platform-orders/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  create: (data) => request.post('/platform-orders/api', data),
  getList: (params) => request.get('/platform-orders', { params }),
  getDetail: (id) => request.get(`/platform-orders/${id}`),
  match: (id, tripId) => request.put(`/platform-orders/${id}/match`, { tripId }),
  autoMatch: (driverId, date) => request.post('/platform-orders/auto-match', { driverId, date })
}

export const reconciliationApi = {
  create: (driverId, date) => request.post('/reconciliations', { driverId, date }),
  getDetail: (driverId, date) => request.get('/reconciliations/detail', { params: { driverId, date } }),
  getList: (params) => request.get('/reconciliations', { params }),
  getDetails: (id) => request.get(`/reconciliations/${id}/details`),
  confirm: (id) => request.put(`/reconciliations/${id}/confirm`),
  getDailyReport: (driverId, date) => request.get(`/reconciliations/daily-report/${driverId}/${date}`)
}

export const appealApi = {
  create: (data) => request.post('/appeals', data),
  getDetail: (id) => request.get(`/appeals/${id}`),
  getDriverList: (driverId, status) => request.get(`/appeals/driver/${driverId}`, { params: { status } }),
  getList: (status) => request.get('/appeals', { params: { status } }),
  handle: (id, data) => request.put(`/appeals/${id}/handle`, data),
  getPendingCount: () => request.get('/appeals/pending/count')
}

export const pricingApi = {
  getActive: () => request.get('/pricing-rules/active'),
  getList: () => request.get('/pricing-rules'),
  create: (data) => request.post('/pricing-rules', data),
  update: (id, data) => request.put(`/pricing-rules/${id}`, data),
  setActive: (id) => request.put(`/pricing-rules/${id}/active`),
  calculate: (data) => request.post('/pricing-rules/calculate', data)
}

export const gpsApi = {
  upload: (data) => request.post('/gps/upload', data),
  uploadBatch: (data) => request.post('/gps/upload-batch', data),
  getList: (params) => request.get('/gps', { params }),
  getByTrip: (tripId) => request.get(`/gps/trip/${tripId}`)
}
