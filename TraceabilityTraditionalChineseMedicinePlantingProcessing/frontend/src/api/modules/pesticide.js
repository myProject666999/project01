import request from '@/api'

export function getPesticideList(params) {
  return request({
    url: '/pesticides',
    method: 'get',
    params
  })
}

export function getPesticideById(id) {
  return request({
    url: `/pesticides/${id}`,
    method: 'get'
  })
}

export function createPesticide(data) {
  return request({
    url: '/pesticides',
    method: 'post',
    data
  })
}

export function updatePesticide(id, data) {
  return request({
    url: `/pesticides/${id}`,
    method: 'put',
    data
  })
}

export function deletePesticide(id) {
  return request({
    url: `/pesticides/${id}`,
    method: 'delete'
  })
}
