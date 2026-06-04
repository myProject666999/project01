import dayjs from 'dayjs'

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export const productStatusMap = {
  0: { label: '待生产', type: 'info' },
  1: { label: '生产中', type: 'warning' },
  2: { label: '已完成', type: 'success' },
  3: { label: '已出库', type: 'primary' },
  4: { label: '已失效', type: 'danger' }
}

export const qrcodeStatusMap = {
  0: { label: '未使用', type: 'info' },
  1: { label: '已激活', type: 'success' },
  2: { label: '已作废', type: 'danger' }
}

export const safetyCheckMap = {
  0: { label: '未检查', type: 'info', color: '#8c8c8c' },
  1: { label: '检查通过', type: 'success', color: '#52c41a' },
  2: { label: '检查不通过', type: 'danger', color: '#f5222d' }
}

export const getProductStatusText = (status) => {
  return productStatusMap[status]?.label || '未知'
}

export const getProductStatusType = (status) => {
  return productStatusMap[status]?.type || 'info'
}

export const getQrcodeStatusText = (status) => {
  return qrcodeStatusMap[status]?.label || '未知'
}

export const getQrcodeStatusType = (status) => {
  return qrcodeStatusMap[status]?.type || 'info'
}

export const getSafetyCheckText = (result) => {
  return safetyCheckMap[result]?.label || '未知'
}

export const getSafetyCheckColor = (result) => {
  return safetyCheckMap[result]?.color || '#8c8c8c'
}

export const getSafetyCheckType = (result) => {
  return safetyCheckMap[result]?.type || 'info'
}

export const generateBatchNo = () => {
  const now = dayjs()
  const dateStr = now.format('YYYYMMDD')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `B${dateStr}${random}`
}

export const generateProductNo = () => {
  const now = dayjs()
  const dateStr = now.format('YYYYMMDD')
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `P${dateStr}${random}`
}

export const generateOutboundNo = () => {
  const now = dayjs()
  const dateStr = now.format('YYYYMMDD')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `O${dateStr}${random}`
}

export const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
    return Promise.resolve()
  } finally {
    document.body.removeChild(textarea)
  }
}

export const debounce = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export const throttle = (fn, delay = 300) => {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn.apply(this, args)
    }
  }
}

export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined || isNaN(num)) return '-'
  return Number(num).toFixed(decimals)
}

export const formatWeight = (weight, unit = 'kg') => {
  if (weight === null || weight === undefined) return '-'
  return `${formatNumber(weight)} ${unit}`
}
