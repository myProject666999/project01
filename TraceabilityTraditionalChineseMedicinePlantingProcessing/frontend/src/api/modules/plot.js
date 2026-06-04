import request from '@/api'

export function getPlotList(params) {
  return request({
    url: '/plots',
    method: 'get',
    params
  })
}

export function getPlotById(id) {
  return request({
    url: `/plots/${id}`,
    method: 'get'
  })
}

export function createPlot(data) {
  return request({
    url: '/plots',
    method: 'post',
    data
  })
}

export function updatePlot(id, data) {
  return request({
    url: `/plots/${id}`,
    method: 'put',
    data
  })
}

export function deletePlot(id) {
  return request({
    url: `/plots/${id}`,
    method: 'delete'
  })
}
