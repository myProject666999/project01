import request from './index'

export function getWaterQualities(params: Record<string, any>) {
  return request.get('/water-quality', { params })
}

export function createWaterQuality(data: Record<string, any>) {
  return request.post('/water-quality', data)
}

export function updateWaterQuality(id: number, data: Record<string, any>) {
  return request.put(`/water-quality/${id}`, data)
}

export function deleteWaterQuality(id: number) {
  return request.delete(`/water-quality/${id}`)
}

export function getWaterQualityTrend(params: Record<string, any>) {
  return request.get('/water-quality/trend', { params })
}

export function getWaterWarnings() {
  return request.get('/water-quality/warnings')
}
