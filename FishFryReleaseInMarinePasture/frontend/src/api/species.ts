import request from './index'

export function getSpecies(params: Record<string, any>) {
  return request.get('/species', { params })
}

export function listAllSpecies() {
  return request.get('/species/list')
}

export function createSpecies(data: Record<string, any>) {
  return request.post('/species', data)
}

export function updateSpecies(id: number, data: Record<string, any>) {
  return request.put(`/species/${id}`, data)
}

export function deleteSpecies(id: number) {
  return request.delete(`/species/${id}`)
}
