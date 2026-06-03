import request from '@/utils/request'

export function getChainList(params) {
  return request({
    url: '/evidence-chains',
    method: 'get',
    params
  })
}

export function getChain(id) {
  return request({
    url: `/evidence-chains/${id}`,
    method: 'get'
  })
}

export function getChainByEvidence(evidenceId) {
  return request({
    url: `/evidence-chains/evidence/${evidenceId}`,
    method: 'get'
  })
}

export function getChainByTask(taskId) {
  return request({
    url: `/evidence-chains/task/${taskId}`,
    method: 'get'
  })
}

export function createChainRecord(data) {
  return request({
    url: '/evidence-chains',
    method: 'post',
    data
  })
}

export function verifyChain(hash) {
  return request({
    url: `/evidence-chains/verify/${hash}`,
    method: 'get'
  })
}

export function getChainTimeline(evidenceId) {
  return request({
    url: `/evidence-chains/${evidenceId}/timeline`,
    method: 'get'
  })
}
