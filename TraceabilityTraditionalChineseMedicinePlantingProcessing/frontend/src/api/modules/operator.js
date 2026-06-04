import request from '@/api'

export function getOperatorList(params) {
  return request({
    url: '/operators',
    method: 'get',
    params
  })
}

export function getOperatorById(id) {
  return request({
    url: `/operators/${id}`,
    method: 'get'
  })
}

export function createOperator(data) {
  return request({
    url: '/operators',
    method: 'post',
    data
  })
}

export function updateOperator(id, data) {
  return request({
    url: `/operators/${id}`,
    method: 'put',
    data
  })
}

export function deleteOperator(id) {
  return request({
    url: `/operators/${id}`,
    method: 'delete'
  })
}
