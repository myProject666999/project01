import request from './index'

export function getDashboardOverview() {
  return request.get('/dashboard/overview')
}

export function getPlanProgress() {
  return request.get('/dashboard/plan-progress')
}

export function getRecaptureTrend() {
  return request.get('/dashboard/recapture-trend')
}

export function getWaterWarnings() {
  return request.get('/dashboard/water-warnings')
}
