import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const products = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
}

export const locations = {
  list: (params) => api.get('/locations', { params }),
  get: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`)
}

export const inbound = {
  list: (params) => api.get('/inbound', { params }),
  get: (id) => api.get(`/inbound/${id}`),
  create: (data) => api.post('/inbound', data),
  receive: (id, data) => api.post(`/inbound/${id}/receive`, data)
}

export const orders = {
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data)
}

export const waves = {
  list: (params) => api.get('/waves', { params }),
  get: (id) => api.get(`/waves/${id}`),
  generate: (data) => api.post('/waves/generate', data),
  pick: (id, data) => api.post(`/waves/${id}/pick`, data)
}

export const review = {
  list: (params) => api.get('/review', { params }),
  get: (id) => api.get(`/review/${id}`),
  start: (data) => api.post('/review/start', data),
  scan: (id, data) => api.post(`/review/${id}/scan`, data),
  complete: (id) => api.post(`/review/${id}/complete`)
}

export const outbound = {
  list: (params) => api.get('/outbound', { params }),
  get: (id) => api.get(`/outbound/${id}`),
  create: (data) => api.post('/outbound/create', data),
  confirm: (id, data) => api.post(`/outbound/${id}/confirm`, data),
  ship: (id) => api.post(`/outbound/${id}/ship`),
  customs: (id, data) => api.post(`/outbound/${id}/customs`, data)
}

export const inventory = {
  list: (params) => api.get('/inventory', { params }),
  stocktakeList: (params) => api.get('/inventory/stocktakes', { params }),
  stocktakeGet: (id) => api.get(`/inventory/stocktakes/${id}`),
  stocktakeCreate: (data) => api.post('/inventory/stocktakes/create', data),
  stocktakeScan: (id, data) => api.post(`/inventory/stocktakes/${id}/scan`, data),
  stocktakeComplete: (id) => api.post(`/inventory/stocktakes/${id}/complete`),
  stocktakeAdjust: (id, data) => api.post(`/inventory/stocktakes/${id}/adjust`, data)
}

export default api
