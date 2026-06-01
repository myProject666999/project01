import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const caseApi = {
  getAll: () => request.get('/cases'),
  getById: (id) => request.get(`/cases/${id}`),
  getByStatus: (status) => request.get(`/cases/status/${status}`),
  getStatistics: () => request.get('/cases/statistics'),
  create: (data) => request.post('/cases', data),
  updateStatus: (id, newStatus, reason) => 
    request.put(`/cases/${id}/status?newStatus=${newStatus}&reason=${reason || ''}`),
  getStatusLogs: (id) => request.get(`/cases/${id}/status-logs`),
  getLawyers: (id) => request.get(`/cases/${id}/lawyers`),
  addLawyer: (id, lawyerId, role) => 
    request.post(`/cases/${id}/lawyers?lawyerId=${lawyerId}&role=${role || 1}`),
  getWorkHours: (id) => request.get(`/cases/${id}/work-hours`),
  getDocuments: (id) => request.get(`/cases/${id}/documents`),
  getCourtSessions: (id) => request.get(`/cases/${id}/court-sessions`)
}

export const lawyerApi = {
  getAll: () => request.get('/lawyers'),
  getActive: () => request.get('/lawyers/active'),
  getById: (id) => request.get(`/lawyers/${id}`),
  create: (data) => request.post('/lawyers', data),
  update: (id, data) => request.put(`/lawyers/${id}`, data),
  delete: (id) => request.delete(`/lawyers/${id}`)
}

export const clientApi = {
  getAll: () => request.get('/clients'),
  getById: (id) => request.get(`/clients/${id}`),
  search: (name) => request.get(`/clients/search?name=${name}`),
  create: (data) => request.post('/clients', data),
  update: (id, data) => request.put(`/clients/${id}`, data),
  delete: (id) => request.delete(`/clients/${id}`)
}

export const workHourApi = {
  getAll: () => request.get('/work-hours'),
  getByCaseId: (caseId) => request.get(`/work-hours/case/${caseId}`),
  getByLawyerId: (lawyerId) => request.get(`/work-hours/lawyer/${lawyerId}`),
  create: (data) => request.post('/work-hours', data),
  update: (id, data) => request.put(`/work-hours/${id}`, data),
  delete: (id) => request.delete(`/work-hours/${id}`),
  getMonthlyBill: (lawyerId, year, month) => 
    request.get(`/work-hours/monthly-bill/${lawyerId}?year=${year}&month=${month}`),
  getAllMonthlyBills: (year, month) => 
    request.get(`/work-hours/monthly-bill/all?year=${year}&month=${month}`)
}

export const documentApi = {
  getTemplates: () => request.get('/documents/templates'),
  getByCaseId: (caseId) => request.get(`/documents/case/${caseId}`),
  generate: (caseId, templateCode) => 
    axios({
      url: `/api/documents/generate/${caseId}/${templateCode}`,
      method: 'GET',
      responseType: 'blob'
    }),
  save: (caseId, templateCode, docName) => 
    request.post(`/documents/save/${caseId}/${templateCode}?docName=${docName}`)
}

export const conflictCheckApi = {
  check: (clientName) => request.get(`/conflict-check?clientName=${clientName}`)
}
