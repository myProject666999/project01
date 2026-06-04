import request from '../utils/axios'

// 拍卖会API
export function getAuctionList(params) {
  return request({
    url: '/auctions',
    method: 'get',
    params
  })
}

export function getAuction(id) {
  return request({
    url: `/auctions/${id}`,
    method: 'get'
  })
}

export function createAuction(data) {
  return request({
    url: '/auctions',
    method: 'post',
    data
  })
}

export function updateAuction(id, data) {
  return request({
    url: `/auctions/${id}`,
    method: 'put',
    data
  })
}

export function deleteAuction(id) {
  return request({
    url: `/auctions/${id}`,
    method: 'delete'
  })
}

// 拍品API
export function getLotList(params) {
  return request({
    url: '/lots',
    method: 'get',
    params
  })
}

export function getLot(id) {
  return request({
    url: `/lots/${id}`,
    method: 'get'
  })
}

export function createLot(data) {
  return request({
    url: '/lots',
    method: 'post',
    data
  })
}

export function updateLot(id, data) {
  return request({
    url: `/lots/${id}`,
    method: 'put',
    data
  })
}

export function updateLotSortOrder(data) {
  return request({
    url: '/lots/sort-order',
    method: 'put',
    data
  })
}

export function deleteLot(id) {
  return request({
    url: `/lots/${id}`,
    method: 'delete'
  })
}

export function addLotImage(lotId, data) {
  return request({
    url: `/lots/${lotId}/images`,
    method: 'post',
    data
  })
}

export function deleteLotImage(lotId, imageId) {
  return request({
    url: `/lots/${lotId}/images/${imageId}`,
    method: 'delete'
  })
}

// 竞买人API
export function getBidderList(params) {
  return request({
    url: '/bidders',
    method: 'get',
    params
  })
}

export function getBidder(id) {
  return request({
    url: `/bidders/${id}`,
    method: 'get'
  })
}

export function createBidder(data) {
  return request({
    url: '/bidders',
    method: 'post',
    data
  })
}

export function updateBidder(id, data) {
  return request({
    url: `/bidders/${id}`,
    method: 'put',
    data
  })
}

export function deleteBidder(id) {
  return request({
    url: `/bidders/${id}`,
    method: 'delete'
  })
}

// 资格审核API
export function getQualificationList(params) {
  return request({
    url: '/qualifications',
    method: 'get',
    params
  })
}

export function createQualification(data) {
  return request({
    url: '/qualifications',
    method: 'post',
    data
  })
}

export function updateQualification(id, data) {
  return request({
    url: `/qualifications/${id}`,
    method: 'put',
    data
  })
}

export function reviewQualification(id, data) {
  return request({
    url: `/qualifications/${id}/review`,
    method: 'post',
    data
  })
}

export function deleteQualification(id) {
  return request({
    url: `/qualifications/${id}`,
    method: 'delete'
  })
}

// 预约API
export function getAppointmentList(params) {
  return request({
    url: '/appointments',
    method: 'get',
    params
  })
}

export function createAppointment(data) {
  return request({
    url: '/appointments',
    method: 'post',
    data
  })
}

export function checkInAppointment(id) {
  return request({
    url: `/appointments/${id}/checkin`,
    method: 'post'
  })
}

export function deleteAppointment(id) {
  return request({
    url: `/appointments/${id}`,
    method: 'delete'
  })
}

// 拍卖结果API
export function getResultList(params) {
  return request({
    url: '/results',
    method: 'get',
    params
  })
}

export function createResult(data) {
  return request({
    url: '/results',
    method: 'post',
    data
  })
}

export function updateResult(id, data) {
  return request({
    url: `/results/${id}`,
    method: 'put',
    data
  })
}

export function deleteResult(id) {
  return request({
    url: `/results/${id}`,
    method: 'delete'
  })
}

// PDF导出
export function exportCatalogue(auctionId) {
  window.open(`/api/pdf/catalogue?auction_id=${auctionId}`, '_blank')
}
