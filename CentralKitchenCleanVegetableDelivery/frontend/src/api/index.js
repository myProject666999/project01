import request from '@/utils/request'

export const getCustomers = () => request.get('/customers')
export const createCustomer = (data) => request.post('/customers', data)
export const updateCustomer = (id, data) => request.put(`/customers/${id}`, data)
export const deleteCustomer = (id) => request.delete(`/customers/${id}`)

export const getProducts = () => request.get('/products')
export const createProduct = (data) => request.post('/products', data)
export const updateProduct = (id, data) => request.put(`/products/${id}`, data)
export const deleteProduct = (id) => request.delete(`/products/${id}`)

export const getOrders = (params) => request.get('/orders', { params })
export const createOrder = (data) => request.post('/orders', data)
export const updateOrderStatus = (id, status) => request.put(`/orders/${id}/status`, { status })

export const getProcessingTasks = (params) => request.get('/processing', { params })
export const generateProcessingTasks = (data) => request.post('/processing/generate', data)
export const updateProcessingStatus = (id, data) => request.put(`/processing/${id}/status`, data)

export const getVehicles = () => request.get('/vehicles')
export const getDeliveries = (params) => request.get('/deliveries', { params })
export const getDeliveryDetail = (id) => request.get(`/deliveries/${id}`)
export const generateDeliveries = (data) => request.post('/deliveries/generate', data)
export const updateDeliveryStatus = (id, status) => request.put(`/deliveries/${id}/status`, { status })
export const signDeliveryItem = (id, data) => request.put(`/deliveries/items/${id}/sign`, data)

export const getTemperatureRecords = (params) => request.get('/temperature', { params })
export const createTemperatureRecord = (data) => request.post('/temperature', data)

export const getWasteRecords = (params) => request.get('/waste', { params })
export const createWasteRecord = (data) => request.post('/waste', data)

export const getEquipment = () => request.get('/equipment')
