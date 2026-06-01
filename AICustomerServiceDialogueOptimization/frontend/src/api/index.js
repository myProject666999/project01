import request from '@/utils/request'

export const conversationApi = {
  list: (params) => request.get('/conversation/list', { params }),
  getById: (id) => request.get(`/conversation/${id}`),
  getMessages: (sessionId) => request.get(`/conversation/${sessionId}/messages`)
}

export const qualityTaskApi = {
  list: (params) => request.get('/quality-task/list', { params }),
  getById: (id) => request.get(`/quality-task/${id}`),
  create: (data) => request.post('/quality-task', data),
  execute: (id) => request.post(`/quality-task/${id}/execute`)
}

export const violationApi = {
  list: (params) => request.get('/violation/list', { params }),
  getById: (id) => request.get(`/violation/${id}`),
  confirm: (id, confirmBy) => request.post(`/violation/${id}/confirm?confirmBy=${confirmBy}`),
  revoke: (id) => request.post(`/violation/${id}/revoke`)
}

export const appealApi = {
  list: (params) => request.get('/appeal/list', { params }),
  getById: (id) => request.get(`/appeal/${id}`),
  submit: (data) => request.post('/appeal/submit', data),
  audit: (id, status, auditOpinion, auditorId, auditorName) =>
    request.post(`/appeal/${id}/audit?status=${status}&auditOpinion=${auditOpinion}&auditorId=${auditorId}&auditorName=${auditorName}`)
}

export const scriptApi = {
  list: (params) => request.get('/script/list', { params }),
  getById: (id) => request.get(`/script/${id}`),
  save: (data) => request.post('/script', data),
  update: (data) => request.put('/script', data),
  delete: (id) => request.delete(`/script/${id}`),
  use: (id) => request.post(`/script/${id}/use`),
  like: (id) => request.post(`/script/${id}/like`)
}

export const scoreApi = {
  getRanking: (month) => request.get('/score/ranking', { params: { month } }),
  recalculate: (month) => request.post('/score/recalculate?month=' + month)
}
