import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(value: number | string | null | undefined): string {
  if (value == null) return '¥0.00'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '¥0.00'
  return '¥' + num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatDate(value: string | null | undefined, format = 'YYYY-MM-DD'): string {
  if (!value) return '-'
  return dayjs(value).format(format)
}

export function formatPercent(value: number | string | null | undefined, decimals = 1): string {
  if (value == null) return '0%'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0%'
  return (num * 100).toFixed(decimals) + '%'
}

export function downloadFile(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
