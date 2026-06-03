import request from '@/utils/request'

export function getEvidenceList(params) {
  return request({
    url: '/evidences',
    method: 'get',
    params
  })
}

export function getEvidence(id) {
  return request({
    url: `/evidences/${id}`,
    method: 'get'
  })
}

export function createEvidence(data) {
  return request({
    url: '/evidences',
    method: 'post',
    data
  })
}

export function updateEvidence(id, data) {
  return request({
    url: `/evidences/${id}`,
    method: 'put',
    data
  })
}

export function deleteEvidence(id) {
  return request({
    url: `/evidences/${id}`,
    method: 'delete'
  })
}

export function getEvidenceByEntrustment(entrustmentId) {
  return request({
    url: `/evidences/entrustment/${entrustmentId}`,
    method: 'get'
  })
}

export function receiveEvidence(id, data) {
  return request({
    url: `/evidences/${id}/receive`,
    method: 'post',
    data
  })
}

export function returnEvidence(id, data) {
  return request({
    url: `/evidences/${id}/return`,
    method: 'post',
    data
  })
}

export function getEvidenceStatusHistory(id) {
  return request({
    url: `/evidences/${id}/status-history`,
    method: 'get'
  })
}
