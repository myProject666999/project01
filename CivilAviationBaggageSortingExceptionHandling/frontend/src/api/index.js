import request from './request'

export function getBaggages(params) {
  return request.get('/baggages', { params })
}

export function getBaggageByTagCode(tagCode) {
  return request.get(`/baggages/${tagCode}`)
}

export function scanBaggage(data) {
  return request.post('/baggages/scan', data)
}

export function getScanLogs(baggageId) {
  return request.get(`/baggages/${baggageId}/scan-logs`)
}

export function getSortingPorts() {
  return request.get('/sortings/ports')
}

export function createSortingPort(data) {
  return request.post('/sortings/ports', data)
}

export function getSortingRules() {
  return request.get('/sortings/rules')
}

export function getActiveRules() {
  return request.get('/sortings/rules/active')
}

export function createSortingRule(data) {
  return request.post('/sortings/rules', data)
}

export function lookupSortingPort(flightNo, time) {
  return request.get(`/sortings/lookup/${flightNo}`, { params: time ? { time } : {} })
}

export function getExceptions(params) {
  return request.get('/exceptions', { params })
}

export function getException(id) {
  return request.get(`/exceptions/${id}`)
}

export function createException(data) {
  return request.post('/exceptions', data)
}

export function updateException(id, data) {
  return request.patch(`/exceptions/${id}`, data)
}

export function getSlaWarnings() {
  return request.get('/exceptions/sla-warnings')
}

export function queryBaggage(data) {
  return request.post('/passenger-query', data)
}
