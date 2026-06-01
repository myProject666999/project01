import request from '../utils/request'

export function getEnvironmentRecords(params) {
  return request({
    url: '/environment-records',
    method: 'get',
    params
  })
}

export function getLatestRecords(params) {
  return request({
    url: '/environment-records/latest',
    method: 'get',
    params
  })
}

export function getEnvironmentStatistics(params) {
  return request({
    url: '/environment-records/statistics',
    method: 'get',
    params
  })
}

export function getAlerts(params) {
  return request({
    url: '/environment-records/alerts',
    method: 'get',
    params
  })
}

export function resolveAlert(id, data) {
  return request({
    url: `/environment-records/alerts/${id}/resolve`,
    method: 'put',
    data
  })
}
