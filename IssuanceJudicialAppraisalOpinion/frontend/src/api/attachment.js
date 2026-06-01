import request from '@/utils/request'

export function getAttachmentList(params) {
  return request({
    url: '/attachment',
    method: 'get',
    params
  })
}

export function getAttachment(id) {
  return request({
    url: `/attachment/${id}`,
    method: 'get'
  })
}

export function uploadAttachment(file, bizType, bizId) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bizType', bizType)
  if (bizId) {
    formData.append('bizId', bizId)
  }
  return request({
    url: '/attachment/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function uploadMultiple(files, bizType, bizId) {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  formData.append('bizType', bizType)
  if (bizId) {
    formData.append('bizId', bizId)
  }
  return request({
    url: '/attachment/upload/multiple',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function downloadAttachment(id) {
  return request({
    url: `/attachment/${id}/download`,
    method: 'get',
    responseType: 'blob'
  })
}

export function previewAttachment(id) {
  return request({
    url: `/attachment/${id}/preview`,
    method: 'get',
    responseType: 'blob'
  })
}

export function deleteAttachment(id) {
  return request({
    url: `/attachment/${id}`,
    method: 'delete'
  })
}

export function getAttachmentsByBiz(bizType, bizId) {
  return request({
    url: `/attachment/biz/${bizType}/${bizId}`,
    method: 'get'
  })
}

export function updateAttachmentBiz(id, bizType, bizId) {
  return request({
    url: `/attachment/${id}/biz`,
    method: 'put',
    data: { bizType, bizId }
  })
}

export function uploadEvidencePhoto(file, evidenceId, location) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('evidenceId', evidenceId)
  formData.append('location', location || '未知')
  return request({
    url: '/attachment/upload/evidence-photo',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
