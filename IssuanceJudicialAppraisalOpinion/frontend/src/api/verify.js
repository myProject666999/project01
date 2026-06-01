import request from '@/utils/request'

export function verifyOpinionByCode(verifyCode) {
  return request({
    url: `/verify/code/${verifyCode}`,
    method: 'get'
  })
}

export function verifyOpinionByHash(hash) {
  return request({
    url: `/verify/hash/${hash}`,
    method: 'get'
  })
}

export function verifyOpinionByQrCode(data) {
  return request({
    url: '/verify/qrcode',
    method: 'post',
    data
  })
}

export function getOpinionPublicInfo(opinionId) {
  return request({
    url: `/verify/opinion/${opinionId}`,
    method: 'get'
  })
}

export function getVerifyHistory(params) {
  return request({
    url: '/verify/history',
    method: 'get',
    params
  })
}

export function verifyIntegrity(opinionId) {
  return request({
    url: `/verify/${opinionId}/integrity`,
    method: 'get'
  })
}

export function verifyChain(opinionId) {
  return request({
    url: `/verify/${opinionId}/chain`,
    method: 'get'
  })
}

export function verifySignature(opinionId) {
  return request({
    url: `/verify/${opinionId}/signature`,
    method: 'get'
  })
}

export function getVerifyReport(opinionId) {
  return request({
    url: `/verify/${opinionId}/report`,
    method: 'get',
    responseType: 'blob'
  })
}
