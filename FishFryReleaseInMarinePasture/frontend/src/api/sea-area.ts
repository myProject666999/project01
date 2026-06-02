import request from './index'

export function getSeaAreas(params: Record<string, any>) {
  return request.get('/sea-areas', { params })
}

export function getSeaArea(id: number) {
  return request.get(`/sea-areas/${id}`)
}

export function createSeaArea(data: Record<string, any>) {
  return request.post('/sea-areas', data)
}

export function updateSeaArea(id: number, data: Record<string, any>) {
  return request.put(`/sea-areas/${id}`, data)
}

export function deleteSeaArea(id: number) {
  return request.delete(`/sea-areas/${id}`)
}
