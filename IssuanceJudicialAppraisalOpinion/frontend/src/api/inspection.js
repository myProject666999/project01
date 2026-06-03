import request from '@/utils/request'

export function getInspectionList(params) {
  return request({
    url: '/inspection-records',
    method: 'get',
    params
  })
}

export function getInspection(id) {
  return request({
    url: `/inspection-records/${id}`,
    method: 'get'
  })
}

export function createInspection(data) {
  return request({
    url: '/inspection-records',
    method: 'post',
    data
  })
}

export function updateInspection(id, data) {
  return request({
    url: `/inspection-records/${id}`,
    method: 'put',
    data
  })
}

export function deleteInspection(id) {
  return request({
    url: `/inspection-records/${id}`,
    method: 'delete'
  })
}

export function getInspectionByTask(taskId) {
  return request({
    url: `/inspection-records/task/${taskId}`,
    method: 'get'
  })
}

export function submitInspection(id) {
  return request({
    url: `/inspection-records/${id}/submit`,
    method: 'post'
  })
}

export function getInspectionRecords(id) {
  return request({
    url: `/inspection-records/${id}/records`,
    method: 'get'
  })
}

export function addInspectionRecord(id, data) {
  return request({
    url: `/inspection-records/${id}/records`,
    method: 'post',
    data
  })
}

export function updateInspectionRecord(id, recordId, data) {
  return request({
    url: `/inspection-records/${id}/records/${recordId}`,
    method: 'put',
    data
  })
}

export function deleteInspectionRecord(id, recordId) {
  return request({
    url: `/inspection-records/${id}/records/${recordId}`,
    method: 'delete'
  })
}
