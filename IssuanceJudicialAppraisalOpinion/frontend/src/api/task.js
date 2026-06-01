import request from '@/utils/request'

export function getTaskList(params) {
  return request({
    url: '/task',
    method: 'get',
    params
  })
}

export function getTask(id) {
  return request({
    url: `/task/${id}`,
    method: 'get'
  })
}

export function createTask(data) {
  return request({
    url: '/task',
    method: 'post',
    data
  })
}

export function updateTask(id, data) {
  return request({
    url: `/task/${id}`,
    method: 'put',
    data
  })
}

export function deleteTask(id) {
  return request({
    url: `/task/${id}`,
    method: 'delete'
  })
}

export function assignTask(id, data) {
  return request({
    url: `/task/${id}/assign`,
    method: 'post',
    data
  })
}

export function acceptTask(id) {
  return request({
    url: `/task/${id}/accept`,
    method: 'post'
  })
}

export function startTask(id) {
  return request({
    url: `/task/${id}/start`,
    method: 'post'
  })
}

export function completeTask(id, data) {
  return request({
    url: `/task/${id}/complete`,
    method: 'post',
    data
  })
}

export function getTaskByEntrustment(entrustmentId) {
  return request({
    url: `/task/entrustment/${entrustmentId}`,
    method: 'get'
  })
}

export function getMyTasks(params) {
  return request({
    url: '/task/my',
    method: 'get',
    params
  })
}
