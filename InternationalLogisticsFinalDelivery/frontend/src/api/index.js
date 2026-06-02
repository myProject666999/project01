import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 30000
})

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code && res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  error => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export const batchAPI = {
  list: (params) => request.get('/batches', { params }),
  get: (id) => request.get(`/batches/${id}`),
  create: (data) => request.post('/batches', data),
  addPackage: (data) => request.post('/batches/packages', data)
}

export const packageAPI = {
  list: (batchId, params) => request.get(`/packages/batch/${batchId}`, { params }),
  get: (id) => request.get(`/packages/${id}`)
}

export const labelAPI = {
  generate: (packageId, lang) => request.get(`/labels/${packageId}`, { params: { lang } }),
  getBarcode: (packageId) => `/api/v1/labels/barcode/${packageId}`,
  getQRCode: (packageNo) => `/api/v1/labels/qrcode/${packageNo}`
}

export const warehouseAPI = {
  list: () => request.get('/warehouses')
}

export const courierAPI = {
  list: (params) => request.get('/couriers', { params }),
  get: (id) => request.get(`/couriers/${id}`),
  getTasks: (courierId, params) => request.get(`/couriers/${courierId}/tasks`, { params })
}

export const routeAPI = {
  list: (params) => request.get('/routes', { params }),
  get: (id) => request.get(`/routes/${id}`),
  create: (data) => request.post('/routes', data),
  start: (id) => request.post(`/routes/${id}/start`),
  complete: (id) => request.post(`/routes/${id}/complete`)
}

export const taskAPI = {
  listPending: (params) => request.get('/tasks/pending', { params }),
  get: (id) => request.get(`/tasks/${id}`),
  start: (id) => request.post(`/tasks/${id}/start`),
  complete: (data) => request.post('/tasks/complete'),
  reportException: (data) => request.post('/tasks/exception')
}

export const exceptionAPI = {
  list: (params) => request.get('/exceptions', { params }),
  get: (id) => request.get(`/exceptions/${id}`),
  handle: (data) => request.post('/exceptions/handle')
}

export const uploadAPI = {
  uploadPhoto: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/upload/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadSignature: (image) => request.post('/upload/signature', { image })
}

export default request
