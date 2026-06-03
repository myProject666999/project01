import request from '@/utils/request'

export function getOpinionList(params) {
  return request({
    url: '/opinions',
    method: 'get',
    params
  })
}

export function getOpinion(id) {
  return request({
    url: `/opinions/${id}`,
    method: 'get'
  })
}

export function createOpinion(data) {
  return request({
    url: '/opinions',
    method: 'post',
    data
  })
}

export function updateOpinion(id, data) {
  return request({
    url: `/opinions/${id}`,
    method: 'put',
    data
  })
}

export function deleteOpinion(id) {
  return request({
    url: `/opinions/${id}`,
    method: 'delete'
  })
}

export function getOpinionByTask(taskId) {
  return request({
    url: `/opinions/entrustment/${taskId}`,
    method: 'get'
  })
}

export function submitOpinion(id) {
  return request({
    url: `/opinions/${id}/submit`,
    method: 'post'
  })
}

export function generateOpinion(id) {
  return request({
    url: `/opinions/${id}/generate`,
    method: 'post'
  })
}

export function previewOpinion(id) {
  return request({
    url: `/opinions/${id}/preview`,
    method: 'get',
    responseType: 'blob'
  })
}

export function downloadOpinion(id) {
  return request({
    url: `/opinions/${id}/download`,
    method: 'get',
    responseType: 'blob'
  })
}

export function getOpinionTemplateList() {
  return request({
    url: '/opinions/templates',
    method: 'get'
  })
}

export function generateQrCode(id) {
  return request({
    url: `/opinions/${id}/qrcode`,
    method: 'get'
  })
}

export function sealOpinion(id, data) {
  return request({
    url: `/opinions/${id}/seal`,
    method: 'post',
    data
  })
}
