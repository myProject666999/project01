import request from '@/utils/request'

export function queryTraceability(data) {
  return request({
    url: '/batch-traceability/query',
    method: 'post',
    data
  })
}

export function getTraceabilityByBatchId(batchId) {
  return request({
    url: `/batch-traceability/batch/${batchId}`,
    method: 'get'
  })
}

export function getTraceabilityDetail(id) {
  return request({
    url: `/batch-traceability/${id}`,
    method: 'get'
  })
}

export function addTraceability(data) {
  return request({
    url: '/batch-traceability',
    method: 'post',
    data
  })
}

export function analyzeTraceability(batchId, traceType) {
  return request({
    url: `/batch-traceability/analyze/${batchId}`,
    method: 'post',
    params: { traceType }
  })
}

export function updateTraceability(data) {
  return request({
    url: '/batch-traceability',
    method: 'put',
    data
  })
}

export function deleteTraceability(id) {
  return request({
    url: `/batch-traceability/${id}`,
    method: 'delete'
  })
}
