export const discoveryTypeLabel: Record<string, string> = {
  footprint: '鞋印',
  clothing: '衣物',
  person: '人员',
  other: '其他',
}

export const discoveryTypeIcon: Record<string, string> = {
  footprint: '👣',
  clothing: '👕',
  person: '🧍',
  other: '📌',
}

export const statusLabel: Record<string, string> = {
  planning: '规划中',
  active: '进行中',
  completed: '已完成',
  unassigned: '未分配',
  searching: '搜索中',
}

export const statusColor: Record<string, string> = {
  planning: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  unassigned: 'bg-gray-100 text-gray-600',
  searching: 'bg-blue-100 text-blue-800',
}

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN')
}

export function degToRad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = degToRad(lat2 - lat1)
  const dLng = degToRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function getMemberColor(teamColor: string, memberIndex: number): string {
  const colors = [
    teamColor,
    adjustBrightness(teamColor, 20),
    adjustBrightness(teamColor, -20),
    adjustBrightness(teamColor, 40),
    adjustBrightness(teamColor, -40),
  ]
  return colors[memberIndex % colors.length]
}

function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}

export const teamColors = [
  '#2196F3',
  '#F44336',
  '#4CAF50',
  '#FF9800',
  '#9C27B0',
  '#00BCD4',
]
