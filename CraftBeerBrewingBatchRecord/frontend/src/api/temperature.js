import request from '@/utils/request'

export function getTemperatureCurve(batchId) {
  return request({
    url: `/fermentation-temperatures/batch/${batchId}`,
    method: 'get'
  })
}

export function getTemperatureByTimeRange(batchId, params) {
  return request({
    url: `/fermentation-temperatures/batch/${batchId}/range`,
    method: 'get',
    params
  })
}

export function addTemperature(data) {
  return request({
    url: '/fermentation-temperatures',
    method: 'post',
    data
  })
}

export function batchAddTemperature(data) {
  return request({
    url: '/fermentation-temperatures/batch',
    method: 'post',
    data
  })
}

export function deleteTemperature(id) {
  return request({
    url: `/fermentation-temperatures/${id}`,
    method: 'delete'
  })
}
