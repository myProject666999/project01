import request from '@/utils/request'

export function getEntrustmentList(params) {
  return request({
    url: '/entrustments',
    method: 'get',
    params
  })
}

export function getEntrustment(id) {
  return request({
    url: `/entrustments/${id}`,
    method: 'get'
  })
}

export function createEntrustment(data) {
  return request({
    url: '/entrustments',
    method: 'post',
    data
  })
}

export function updateEntrustment(id, data) {
  return request({
    url: `/entrustments/${id}`,
    method: 'put',
    data
  })
}

export function deleteEntrustment(id) {
  return request({
    url: `/entrustments/${id}`,
    method: 'delete'
  })
}

export function submitEntrustment(id) {
  return request({
    url: `/entrustments/${id}/submit`,
    method: 'post'
  })
}

export function approveEntrustment(id, data) {
  return request({
    url: `/entrustments/${id}/approve`,
    method: 'post',
    data
  })
}

export function rejectEntrustment(id, data) {
  return request({
    url: `/entrustments/${id}/reject`,
    method: 'post',
    data
  })
}
