import request from '@/utils/request'

export function getEvidenceList(params) {
  return request({
    url: '/evidence',
    method: 'get',
    params
  })
}

export function getEvidence(id) {
  return request({
    url: `/evidence/${id}`,
    method: 'get'
  })
}

export function createEvidence(data) {
  return request({
    url: '/evidence',
    method: 'post',
    data
  })
}

export function updateEvidence(id, data) {
  return request({
    url: `/evidence/${id}`,
    method: 'put',
    data
  })
}

export function deleteEvidence(id) {
  return request({
    url: `/evidence/${id}`,
    method: 'delete'
  })
}

export function getEvidenceByEntrustment(entrustmentId) {
  return request({
    url: `/evidence/entrustment/${entrustmentId}`,
    method: 'get'
  })
}

export function receiveEvidence(id, data) {
  return request({
    url: `/evidence/${id}/receive`,
    method: 'post',
    data
  })
}

export function returnEvidence(id, data) {
  return request({
    url: `/evidence/${id}/return`,
    method: 'post',
    data
  })
}

export function getEvidenceStatusHistory(id) {
  return request({
    url: `/evidence/${id}/status-history`,
    method: 'get'
  })
}
