import request from '@/api'

export function getOutboundList(params) {
  return request({
    url: '/outbounds',
    method: 'get',
    params
  })
}

export function getOutboundById(id) {
  return request({
    url: `/outbounds/${id}`,
    method: 'get'
  })
}

export function getOutboundSafetyCheck(productId) {
  return request({
    url: `/outbounds/safety-check/${productId}`,
    method: 'get'
  })
}

export function createOutbound(data) {
  return request({
    url: '/outbounds',
    method: 'post',
    data
  })
}
