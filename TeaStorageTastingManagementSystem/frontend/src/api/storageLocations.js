import request from '../utils/request'

export function getStorageLocations(params) {
  return request({
    url: '/storage-locations',
    method: 'get',
    params
  })
}

export function getAllStorageLocations() {
  return request({
    url: '/storage-locations/all',
    method: 'get'
  })
}

export function getSuitableLocations(params) {
  return request({
    url: '/storage-locations/suitable',
    method: 'get',
    params
  })
}

export function getStorageLocation(id) {
  return request({
    url: `/storage-locations/${id}`,
    method: 'get'
  })
}

export function createStorageLocation(data) {
  return request({
    url: '/storage-locations',
    method: 'post',
    data
  })
}

export function updateStorageLocation(id, data) {
  return request({
    url: `/storage-locations/${id}`,
    method: 'put',
    data
  })
}

export function deleteStorageLocation(id) {
  return request({
    url: `/storage-locations/${id}`,
    method: 'delete'
  })
}
