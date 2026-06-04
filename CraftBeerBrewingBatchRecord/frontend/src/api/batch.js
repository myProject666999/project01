import request from '@/utils/request'

export function getBatchList(params) {
  return request({
    url: '/batches/page',
    method: 'get',
    params
  })
}

export function getAllBatches() {
  return request({
    url: '/batches',
    method: 'get'
  })
}

export function getBatchDetail(id) {
  return request({
    url: `/batches/${id}`,
    method: 'get'
  })
}

export function getBatchByNo(batchNo) {
  return request({
    url: `/batches/no/${batchNo}`,
    method: 'get'
  })
}

export function addBatch(data) {
  return request({
    url: '/batches',
    method: 'post',
    data
  })
}

export function updateBatch(data) {
  return request({
    url: '/batches',
    method: 'put',
    data
  })
}

export function deleteBatch(id) {
  return request({
    url: `/batches/${id}`,
    method: 'delete'
  })
}

export function traceByMaterial(materialId) {
  return request({
    url: `/batches/trace/material/${materialId}`,
    method: 'get'
  })
}

export function traceByProcess(processTypeId) {
  return request({
    url: `/batches/trace/process/${processTypeId}`,
    method: 'get'
  })
}

export function traceBatch(data) {
  return request({
    url: '/batches/trace',
    method: 'post',
    data
  })
}
