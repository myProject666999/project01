import request from '@/api'

export function getHarvestBatchList(params) {
  return request({
    url: '/harvest-batches',
    method: 'get',
    params
  })
}

export function getHarvestBatchById(id) {
  return request({
    url: `/harvest-batches/${id}`,
    method: 'get'
  })
}

export function createHarvestBatch(data) {
  return request({
    url: '/harvest-batches',
    method: 'post',
    data
  })
}

export function updateHarvestBatch(id, data) {
  return request({
    url: `/harvest-batches/${id}`,
    method: 'put',
    data
  })
}

export function deleteHarvestBatch(id) {
  return request({
    url: `/harvest-batches/${id}`,
    method: 'delete'
  })
}
