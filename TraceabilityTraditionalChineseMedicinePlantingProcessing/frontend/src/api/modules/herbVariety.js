import request from '@/api'

export function getHerbVarietyList(params) {
  return request({
    url: '/herb-varieties',
    method: 'get',
    params
  })
}

export function getHerbVarietyById(id) {
  return request({
    url: `/herb-varieties/${id}`,
    method: 'get'
  })
}

export function createHerbVariety(data) {
  return request({
    url: '/herb-varieties',
    method: 'post',
    data
  })
}

export function updateHerbVariety(id, data) {
  return request({
    url: `/herb-varieties/${id}`,
    method: 'put',
    data
  })
}

export function deleteHerbVariety(id) {
  return request({
    url: `/herb-varieties/${id}`,
    method: 'delete'
  })
}
