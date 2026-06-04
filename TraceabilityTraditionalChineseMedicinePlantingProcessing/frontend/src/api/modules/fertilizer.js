import request from '@/api'

export function getFertilizerList(params) {
  return request({
    url: '/fertilizers',
    method: 'get',
    params
  })
}

export function getFertilizerById(id) {
  return request({
    url: `/fertilizers/${id}`,
    method: 'get'
  })
}

export function createFertilizer(data) {
  return request({
    url: '/fertilizers',
    method: 'post',
    data
  })
}

export function updateFertilizer(id, data) {
  return request({
    url: `/fertilizers/${id}`,
    method: 'put',
    data
  })
}

export function deleteFertilizer(id) {
  return request({
    url: `/fertilizers/${id}`,
    method: 'delete'
  })
}
