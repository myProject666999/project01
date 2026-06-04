import request from '@/utils/request'

export function getTastingList(params) {
  return request({
    url: '/tasting-records/page',
    method: 'get',
    params
  })
}

export function getTastingByBatchId(batchId) {
  return request({
    url: `/tasting-records/batch/${batchId}`,
    method: 'get'
  })
}

export function getAverageScores(batchId) {
  return request({
    url: `/tasting-records/batch/${batchId}/average`,
    method: 'get'
  })
}

export function getFailedRecords() {
  return request({
    url: '/tasting-records/failed',
    method: 'get'
  })
}

export function getTastingDetail(id) {
  return request({
    url: `/tasting-records/${id}`,
    method: 'get'
  })
}

export function addTasting(data) {
  return request({
    url: '/tasting-records',
    method: 'post',
    data
  })
}

export function updateTasting(data) {
  return request({
    url: '/tasting-records',
    method: 'put',
    data
  })
}

export function deleteTasting(id) {
  return request({
    url: `/tasting-records/${id}`,
    method: 'delete'
  })
}
