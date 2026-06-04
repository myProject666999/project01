import type { Mission, SubArea, RescueTeam, Member, GPSPoint, Discovery, CoverageResult, BatchGPSRequest } from '@/types'

const API_BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

export const api = {
  missions: {
    list: () => request<Mission[]>('/missions'),
    get: (id: number) => request<Mission>(`/missions/${id}`),
    create: (data: Partial<Mission>) => request<Mission>('/missions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: Partial<Mission>) => request<Mission>(`/missions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => request(`/missions/${id}`, { method: 'DELETE' }),
  },

  subAreas: {
    list: (missionId: number) => request<SubArea[]>(`/missions/${missionId}/sub-areas`),
    create: (missionId: number, data: Partial<SubArea>) => request<SubArea>('/sub-areas', {
      method: 'POST',
      body: JSON.stringify({ ...data, missionId }),
    }),
    update: (id: number, data: Partial<SubArea>) => request<SubArea>(`/sub-areas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => request(`/sub-areas/${id}`, { method: 'DELETE' }),
  },

  teams: {
    list: () => request<RescueTeam[]>('/teams'),
    get: (id: number) => request<RescueTeam>(`/teams/${id}`),
    members: (teamId: number) => request<Member[]>(`/teams/${teamId}/members`),
    allMembers: () => request<Member[]>('/members'),
  },

  gps: {
    batch: (data: BatchGPSRequest) => request('/gps/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    trajectories: (missionId: number) => request<GPSPoint[]>(`/gps/mission/${missionId}`),
    latest: (missionId: number) => request<GPSPoint[]>(`/gps/mission/${missionId}/latest`),
    range: (missionId: number, start: string, end: string) =>
      request<GPSPoint[]>(`/gps/mission/${missionId}/range?start=${start}&end=${end}`),
  },

  coverage: {
    get: (missionId: number) => request<CoverageResult>(`/coverage/mission/${missionId}`),
    heatmap: (missionId: number) => request<[number, number, number][]>(`/coverage/mission/${missionId}/heatmap`),
  },

  discoveries: {
    list: (missionId: number, type?: string) => {
      const url = type ? `/discoveries/mission/${missionId}?type=${type}` : `/discoveries/mission/${missionId}`
      return request<Discovery[]>(url)
    },
    get: (id: number) => request<Discovery>(`/discoveries/${id}`),
    create: (missionId: number, data: Partial<Discovery>) => request<Discovery>('/discoveries', {
      method: 'POST',
      body: JSON.stringify({ ...data, missionId }),
    }),
    update: (id: number, data: Partial<Discovery>) => request<Discovery>(`/discoveries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => request(`/discoveries/${id}`, { method: 'DELETE' }),
  },
}

export const getWebSocketUrl = (missionId: number) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  return `${protocol}//${host}/ws/position/${missionId}`
}
