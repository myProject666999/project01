import request from '@/api'

export function getQRCodeList(params) {
  return request({
    url: '/qrcodes',
    method: 'get',
    params
  })
}

export function getQRCodeById(id) {
  return request({
    url: `/qrcodes/${id}`,
    method: 'get'
  })
}

export function getQRCodeImage(id) {
  return request({
    url: `/qrcodes/${id}/image`,
    method: 'get',
    responseType: 'blob'
  })
}

export function createQRCode(data) {
  return request({
    url: '/qrcodes',
    method: 'post',
    data
  })
}

export function generateQRCodeForProduct(data) {
  return request({
    url: '/qrcodes/generate',
    method: 'post',
    data
  })
}
