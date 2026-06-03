import { create } from 'zustand'
import { inventoryApi, type InventoryItem, type InventoryRecord } from '@/api/client'

interface InventoryState {
  items: InventoryItem[]
  loading: boolean
  current: InventoryItem | null
  records: InventoryRecord[]
  fetchItems: (params?: Record<string, string | number | undefined>) => Promise<void>
  fetchItem: (id: number) => Promise<void>
  fetchRecords: (id: number) => Promise<void>
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  loading: false,
  current: null,
  records: [],
  fetchItems: async (params) => {
    set({ loading: true })
    try {
      const items = await inventoryApi.list(params)
      set({ items, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  fetchItem: async (id) => {
    set({ loading: true })
    try {
      const item = await inventoryApi.get(id)
      set({ current: item, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  fetchRecords: async (id) => {
    try {
      const records = await inventoryApi.records(id)
      set({ records })
    } catch {
      set({ records: [] })
    }
  },
}))
