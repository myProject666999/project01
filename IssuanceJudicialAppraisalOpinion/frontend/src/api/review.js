import request from '@/utils/request'

export function getReviewList(params) {
  return request({
    url: '/review',
    method: 'get',
    params
  })
}

export function getReview(id) {
  return request({
    url: `/review/${id}`,
    method: 'get'
  })
}

export function createReview(data) {
  return request({
    url: '/review',
    method: 'post',
    data
  })
}

export function updateReview(id, data) {
  return request({
    url: `/review/${id}`,
    method: 'put',
    data
  })
}

export function deleteReview(id) {
  return request({
    url: `/review/${id}`,
    method: 'delete'
  })
}

export function getReviewByOpinion(opinionId) {
  return request({
    url: `/review/opinion/${opinionId}`,
    method: 'get'
  })
}

export function assignReview(id, data) {
  return request({
    url: `/review/${id}/assign`,
    method: 'post',
    data
  })
}

export function acceptReview(id) {
  return request({
    url: `/review/${id}/accept`,
    method: 'post'
  })
}

export function submitReview(id, data) {
  return request({
    url: `/review/${id}/submit`,
    method: 'post',
    data
  })
}

export function approveReview(id, data) {
  return request({
    url: `/review/${id}/approve`,
    method: 'post',
    data
  })
}

export function rejectReview(id, data) {
  return request({
    url: `/review/${id}/reject`,
    method: 'post',
    data
  })
}

export function getMyReviews(params) {
  return request({
    url: '/review/my',
    method: 'get',
    params
  })
}

export function getReviewHistory(opinionId) {
  return request({
    url: `/review/opinion/${opinionId}/history`,
    method: 'get'
  })
}
