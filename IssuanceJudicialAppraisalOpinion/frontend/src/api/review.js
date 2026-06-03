import request from '@/utils/request'

export function getReviewList(params) {
  return request({
    url: '/reviews',
    method: 'get',
    params
  })
}

export function getReview(id) {
  return request({
    url: `/reviews/${id}`,
    method: 'get'
  })
}

export function createReview(data) {
  return request({
    url: '/reviews',
    method: 'post',
    data
  })
}

export function updateReview(id, data) {
  return request({
    url: `/reviews/${id}`,
    method: 'put',
    data
  })
}

export function deleteReview(id) {
  return request({
    url: `/reviews/${id}`,
    method: 'delete'
  })
}

export function getReviewByOpinion(opinionId) {
  return request({
    url: `/reviews/opinion/${opinionId}`,
    method: 'get'
  })
}

export function assignReview(id, data) {
  return request({
    url: `/reviews/${id}/assign`,
    method: 'post',
    data
  })
}

export function acceptReview(id) {
  return request({
    url: `/reviews/${id}/accept`,
    method: 'post'
  })
}

export function submitReview(id, data) {
  return request({
    url: `/reviews/${id}/submit`,
    method: 'post',
    data
  })
}

export function approveReview(id, data) {
  return request({
    url: `/reviews/${id}/approve`,
    method: 'post',
    data
  })
}

export function rejectReview(id, data) {
  return request({
    url: `/reviews/${id}/reject`,
    method: 'post',
    data
  })
}

export function getMyReviews(params) {
  return request({
    url: '/reviews/my',
    method: 'get',
    params
  })
}

export function getReviewHistory(opinionId) {
  return request({
    url: `/reviews/opinion/${opinionId}/history`,
    method: 'get'
  })
}
