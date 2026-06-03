import request from '@/utils/request'

export function verifyOpinionByCode(verifyCode) {
  return request({
    url: `/verify/${verifyCode}`,
    method: 'get'
  })
}
