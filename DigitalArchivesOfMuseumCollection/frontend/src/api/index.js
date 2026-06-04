import request from '@/utils/request'

export const login = (data) => request.post('/auth/login', data)
export const getCurrentUser = () => request.get('/auth/me')
export const changePassword = (data) => request.post('/auth/change-password', data)

export const getStatistics = () => request.get('/statistics')

export const getCollections = (params) => request.get('/collections', { params })
export const getCollection = (id) => request.get(`/collections/${id}`)
export const createCollection = (data) => request.post('/collections', data)
export const updateCollection = (id, data) => request.put(`/collections/${id}`, data)
export const deleteCollection = (id) => request.delete(`/collections/${id}`)
export const getCollectionByQR = (qrCode) => request.get(`/collections/qr/${qrCode}`)

export const uploadPhoto = (data) => request.post('/photos', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const deletePhoto = (id) => request.delete(`/photos/${id}`)

export const upload3DModel = (data) => request.post('/3d-models', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const delete3DModel = (id) => request.delete(`/3d-models/${id}`)

export const getMovements = (params) => request.get('/movements', { params })
export const getMovement = (id) => request.get(`/movements/${id}`)
export const createMovement = (data) => request.post('/movements', data)
export const approveMovement = (id) => request.post(`/movements/${id}/approve`)
export const outHandover = (id) => request.post(`/movements/${id}/out-handover`)
export const inHandover = (id) => request.post(`/movements/${id}/in-handover`)

export const createPackingList = (data) => request.post('/packing-lists', data)
export const getPackingList = (id) => request.get(`/packing-lists/${id}`)

export const getInventoryPlans = (params) => request.get('/inventory/plans', { params })
export const getInventoryPlan = (id) => request.get(`/inventory/plans/${id}`)
export const createInventoryPlan = (data) => request.post('/inventory/plans', data)
export const startInventory = (id) => request.post(`/inventory/plans/${id}/start`)
export const completeInventory = (id) => request.post(`/inventory/plans/${id}/complete`)
export const getInventoryItems = (params) => request.get('/inventory/items', { params })
export const checkInventoryItem = (data) => request.post('/inventory/check', data)
export const batchCheckInventory = (data) => request.post('/inventory/batch-check', data)

export const getStatusRecords = (params) => request.get('/status-records', { params })
export const getStatusRecord = (id) => request.get(`/status-records/${id}`)
export const createStatusRecord = (data) => request.post('/status-records', data)

export const getCategories = () => request.get('/categories')
export const createCategory = (data) => request.post('/categories', data)

export const getLocations = (params) => request.get('/locations', { params })
export const createLocation = (data) => request.post('/locations', data)
