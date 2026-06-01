import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err)
    return Promise.reject(err)
  }
)

export const getGreenBeans = () => api.get('/green-beans')
export const getGreenBean = (id) => api.get(`/green-beans/${id}`)
export const createGreenBean = (data) => api.post('/green-beans', data)
export const updateGreenBean = (id, data) => api.put(`/green-beans/${id}`, data)
export const deleteGreenBean = (id) => api.delete(`/green-beans/${id}`)

export const getRoastingRecords = () => api.get('/roasting-records')
export const getRoastingRecord = (id) => api.get(`/roasting-records/${id}`)
export const createRoastingRecord = (data) => api.post('/roasting-records', data)
export const updateRoastingRecord = (id, data) => api.put(`/roasting-records/${id}`, data)
export const deleteRoastingRecord = (id) => api.delete(`/roasting-records/${id}`)
export const compareRoastingRecords = (ids) => api.get('/roasting-records/compare', { params: { ids: ids.join(',') } })
export const importArtisan = (data) => api.post('/roasting-records/import-artisan', data)

export const getCuppingScores = () => api.get('/cupping-scores')
export const getCuppingScore = (id) => api.get(`/cupping-scores/${id}`)
export const createCuppingScore = (data) => api.post('/cupping-scores', data)
export const updateCuppingScore = (id, data) => api.put(`/cupping-scores/${id}`, data)
export const deleteCuppingScore = (id) => api.delete(`/cupping-scores/${id}`)

export default api
