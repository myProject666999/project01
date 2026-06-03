import { create } from 'zustand'
import { stocktakingApi, type Stocktaking, type StocktakingItem } from '@/api/client'

interface StocktakingState {
  list: Stocktaking[]
  loading: boolean
  current: Stocktaking | null
  items: StocktakingItem[]
  fetchList: () => Promise<void>
  fetchStocktaking: (id: number) => Promise<void>
  create: (data: { scopeType?: string; scopeId?: number; createdBy: number }) => Promise<void>
  updateItem: (id: number, itemId: number, data: { actualQuantity: number; remark?: string }) => Promise<void>
  complete: (id: number) => Promise<void>
  approve: (id: number, data: { approvedBy: number }) => Promise<void>
}

export const useStocktakingStore = create<StocktakingState>((set) => ({
  list: [],
  loading: false,
  current: null,
  items: [],
  fetchList: async () => {
    set({ loading: true })
    try {
      const list = await stocktakingApi.list()
      set({ list, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  fetchStocktaking: async (id) => {
    set({ loading: true })
    try {
      const st = await stocktakingApi.get(id)
      set({ current: st, items: st.items ?? [], loading: false })
    } catch {
      set({ loading: false })
    }
  },
  create: async (data) => {
    await stocktakingApi.create(data)
  },
  updateItem: async (id, itemId, data) => {
    await stocktakingApi.updateItem(id, itemId, data)
  },
  complete: async (id) => {
    await stocktakingApi.complete(id)
  },
  approve: async (id, data) => {
    await stocktakingApi.approve(id, data)
  },
}))
