import request from '@/utils/request'

export function getOpinionList(params) {
  return request({
    url: '/opinion',
    method: 'get',
    params
  })
}

export function getOpinion(id) {
  return request({
    url: `/opinion/${id}`,
    method: 'get'
  })
}

export function createOpinion(data) {
  return request({
    url: '/opinion',
    method: 'post',
    data
  })
}

export function updateOpinion(id, data) {
  return request({
    url: `/opinion/${id}`,
    method: 'put',
    data
  })
}

export function deleteOpinion(id) {
  return request({
    url: `/opinion/${id}`,
    method: 'delete'
  })
}

export function getOpinionByTask(taskId) {
  return request({
    url: `/opinion/task/${taskId}`,
    method: 'get'
  })
}

export function submitOpinion(id) {
  return request({
    url: `/opinion/${id}/submit`,
    method: 'post'
  })
}

export function generateOpinion(id) {
  return request({
    url: `/opinion/${id}/generate`,
    method: 'post'
  })
}

export function previewOpinion(id) {
  return request({
    url: `/opinion/${id}/preview`,
    method: 'get',
    responseType: 'blob'
  })
}

export function downloadOpinion(id) {
  return request({
    url: `/opinion/${id}/download`,
    method: 'get',
    responseType: 'blob'
  })
}

export function getOpinionTemplateList() {
  return request({
    url: '/opinion/templates',
    method: 'get'
  })
}

export function generateQrCode(id) {
  return request({
    url: `/opinion/${id}/qrcode`,
    method: 'get'
  })
}

export function sealOpinion(id, data) {
  return request({
    url: `/opinion/${id}/seal`,
    method: 'post',
    data
  })
}
