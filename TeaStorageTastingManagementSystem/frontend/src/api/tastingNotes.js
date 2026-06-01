import request from '../utils/request'

export function getTastingNotes(params) {
  return request({
    url: '/tasting-notes',
    method: 'get',
    params
  })
}

export function getConversionCurve(teaProductId) {
  return request({
    url: `/tasting-notes/conversion-curve/${teaProductId}`,
    method: 'get'
  })
}

export function getTastingNote(id) {
  return request({
    url: `/tasting-notes/${id}`,
    method: 'get'
  })
}

export function createTastingNote(data) {
  return request({
    url: '/tasting-notes',
    method: 'post',
    data
  })
}

export function updateTastingNote(id, data) {
  return request({
    url: `/tasting-notes/${id}`,
    method: 'put',
    data
  })
}

export function deleteTastingNote(id) {
  return request({
    url: `/tasting-notes/${id}`,
    method: 'delete'
  })
}
