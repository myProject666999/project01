import request from '@/api'

export function getFarmingRecordList(params) {
  return request({
    url: '/farming-records',
    method: 'get',
    params
  })
}

export function getFarmingRecordById(id) {
  return request({
    url: `/farming-records/${id}`,
    method: 'get'
  })
}

export function createFarmingRecord(data) {
  return request({
    url: '/farming-records',
    method: 'post',
    data
  })
}

export function updateFarmingRecord(id, data) {
  return request({
    url: `/farming-records/${id}`,
    method: 'put',
    data
  })
}

export function deleteFarmingRecord(id) {
  return request({
    url: `/farming-records/${id}`,
    method: 'delete'
  })
}

export function getFarmingOperationTypes() {
  return request({
    url: '/farming-operation-types',
    method: 'get'
  })
}
