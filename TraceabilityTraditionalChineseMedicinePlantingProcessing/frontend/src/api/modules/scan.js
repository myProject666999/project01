import axios from 'axios'

const scanRequest = axios.create({
  baseURL: '/',
  timeout: 10000
})

scanRequest.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      return Promise.reject(new Error(res.message || '查询失败'))
    }
    return res.data
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      if (status === 429) {
        return Promise.reject(new Error('请求过于频繁，请稍后再试'))
      }
      return Promise.reject(new Error(error.response.data?.message || '查询失败'))
    }
    return Promise.reject(error)
  }
)

export function getTraceabilityByQRCode(qrCode) {
  return scanRequest({
    url: `/scan/${qrCode}`,
    method: 'get'
  })
}
