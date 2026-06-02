import request from './index'

export function getReleaseRecords(params: Record<string, any>) {
  return request.get('/release-records', { params })
}

export function createReleaseRecord(data: Record<string, any>) {
  return request.post('/release-records', data)
}

export function updateReleaseRecord(id: number, data: Record<string, any>) {
  return request.put(`/release-records/${id}`, data)
}

export function deleteReleaseRecord(id: number) {
  return request.delete(`/release-records/${id}`)
}
