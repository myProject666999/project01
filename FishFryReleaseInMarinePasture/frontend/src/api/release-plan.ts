import request from './index'

export function getReleasePlans(params: Record<string, any>) {
  return request.get('/release-plans', { params })
}

export function getReleasePlan(id: number) {
  return request.get(`/release-plans/${id}`)
}

export function createReleasePlan(data: Record<string, any>) {
  return request.post('/release-plans', data)
}

export function updateReleasePlan(id: number, data: Record<string, any>) {
  return request.put(`/release-plans/${id}`, data)
}

export function deleteReleasePlan(id: number) {
  return request.delete(`/release-plans/${id}`)
}

export function getPlanProgress() {
  return request.get('/release-plans/progress')
}
