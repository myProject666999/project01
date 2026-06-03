import request from '@/utils/request'

export function getTaskList(params) {
  return request({
    url: '/tasks',
    method: 'get',
    params
  })
}

export function getTask(id) {
  return request({
    url: `/tasks/${id}`,
    method: 'get'
  })
}

export function createTask(data) {
  return request({
    url: '/tasks',
    method: 'post',
    data
  })
}

export function updateTask(id, data) {
  return request({
    url: `/tasks/${id}`,
    method: 'put',
    data
  })
}

export function deleteTask(id) {
  return request({
    url: `/tasks/${id}`,
    method: 'delete'
  })
}

export function assignTask(id, data) {
  return request({
    url: `/tasks/${id}/assign`,
    method: 'post',
    data
  })
}

export function acceptTask(id) {
  return request({
    url: `/tasks/${id}/accept`,
    method: 'post'
  })
}

export function startTask(id) {
  return request({
    url: `/tasks/${id}/start`,
    method: 'post'
  })
}

export function completeTask(id, data) {
  return request({
    url: `/tasks/${id}/complete`,
    method: 'post',
    data
  })
}

export function getTaskByEntrustment(entrustmentId) {
  return request({
    url: `/tasks/entrustment/${entrustmentId}`,
    method: 'get'
  })
}

export function getMyTasks(params) {
  return request({
    url: '/tasks/my',
    method: 'get',
    params
  })
}
