import request from '@/utils/request'

export function getMaterialList(params) {
  return request({
    url: '/materials/page',
    method: 'get',
    params
  })
}

export function getAllMaterials() {
  return request({
    url: '/materials',
    method: 'get'
  })
}

export function getMaterialsByType(materialTypeId) {
  return request({
    url: `/materials/by-type/${materialTypeId}`,
    method: 'get'
  })
}

export function getMaterialDetail(id) {
  return request({
    url: `/materials/${id}`,
    method: 'get'
  })
}

export function addMaterial(data) {
  return request({
    url: '/materials',
    method: 'post',
    data
  })
}

export function updateMaterial(data) {
  return request({
    url: '/materials',
    method: 'put',
    data
  })
}

export function deleteMaterial(id) {
  return request({
    url: `/materials/${id}`,
    method: 'delete'
  })
}
