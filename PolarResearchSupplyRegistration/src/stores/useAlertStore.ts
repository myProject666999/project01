import { create } from 'zustand'
import { alertApi, type Alert } from '@/api/client'

interface AlertState {
  alerts: Alert[]
  loading: boolean
  fetchAlerts: () => Promise<void>
  calculate: () => Promise<void>
  resolve: (id: number) => Promise<void>
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  loading: false,
  fetchAlerts: async () => {
    set({ loading: true })
    try {
      const alerts = await alertApi.list()
      set({ alerts, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  calculate: async () => {
    await alertApi.calculate()
  },
  resolve: async (id) => {
    await alertApi.resolve(id)
  },
}))
