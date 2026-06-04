import request from '@/api'

export function getProcessingRecordList(params) {
  return request({
    url: '/processing-records',
    method: 'get',
    params
  })
}

export function getProcessingRecordById(id) {
  return request({
    url: `/processing-records/${id}`,
    method: 'get'
  })
}

export function createProcessingRecord(data) {
  return request({
    url: '/processing-records',
    method: 'post',
    data
  })
}

export function updateProcessingRecord(id, data) {
  return request({
    url: `/processing-records/${id}`,
    method: 'put',
    data
  })
}

export function deleteProcessingRecord(id) {
  return request({
    url: `/processing-records/${id}`,
    method: 'delete'
  })
}

export function getProcessingStepTypes() {
  return request({
    url: '/processing-step-types',
    method: 'get'
  })
}
