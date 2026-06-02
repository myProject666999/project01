import request from './index'

export function getRecaptureRecords(params: Record<string, any>) {
  return request.get('/recapture-records', { params })
}

export function createRecaptureRecord(data: Record<string, any>) {
  return request.post('/recapture-records', data)
}

export function updateRecaptureRecord(id: number, data: Record<string, any>) {
  return request.put(`/recapture-records/${id}`, data)
}

export function deleteRecaptureRecord(id: number) {
  return request.delete(`/recapture-records/${id}`)
}

export function getRecaptureAnalysis(params: Record<string, any>) {
  return request.get('/recapture-records/analysis', { params })
}

export function getRecaptureTrend(params: Record<string, any>) {
  return request.get('/recapture-records/analysis/trend', { params })
}
