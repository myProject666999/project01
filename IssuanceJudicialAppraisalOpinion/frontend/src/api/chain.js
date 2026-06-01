import request from '@/utils/request'

export function getChainList(params) {
  return request({
    url: '/chain',
    method: 'get',
    params
  })
}

export function getChain(id) {
  return request({
    url: `/chain/${id}`,
    method: 'get'
  })
}

export function getChainByEvidence(evidenceId) {
  return request({
    url: `/chain/evidence/${evidenceId}`,
    method: 'get'
  })
}

export function getChainByTask(taskId) {
  return request({
    url: `/chain/task/${taskId}`,
    method: 'get'
  })
}

export function createChainRecord(data) {
  return request({
    url: '/chain',
    method: 'post',
    data
  })
}

export function verifyChain(hash) {
  return request({
    url: `/chain/verify/${hash}`,
    method: 'get'
  })
}

export function getChainTimeline(evidenceId) {
  return request({
    url: `/chain/${evidenceId}/timeline`,
    method: 'get'
  })
}
