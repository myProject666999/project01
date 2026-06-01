import request from '../utils/request'

export function getTeaProducts(params) {
  return request({
    url: '/tea-products',
    method: 'get',
    params
  })
}

export function getTeaProduct(id) {
  return request({
    url: `/tea-products/${id}`,
    method: 'get'
  })
}

export function createTeaProduct(data) {
  return request({
    url: '/tea-products',
    method: 'post',
    data
  })
}

export function updateTeaProduct(id, data) {
  return request({
    url: `/tea-products/${id}`,
    method: 'put',
    data
  })
}

export function deleteTeaProduct(id) {
  return request({
    url: `/tea-products/${id}`,
    method: 'delete'
  })
}
