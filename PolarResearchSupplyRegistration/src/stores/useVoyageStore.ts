import { create } from 'zustand'
import { voyageApi, type Voyage, type VoyageSupply } from '@/api/client'

interface VoyageState {
  voyages: Voyage[]
  loading: boolean
  current: Voyage | null
  supplies: VoyageSupply[]
  fetchVoyages: () => Promise<void>
  fetchVoyage: (id: number) => Promise<void>
  createVoyage: (data: Partial<Voyage>) => Promise<void>
  updateVoyage: (id: number, data: Partial<Voyage>) => Promise<void>
  deleteVoyage: (id: number) => Promise<void>
  addSupplies: (id: number, data: { supplies: { supplyId: number; targetWarehouseId: number; quantity: number }[] }) => Promise<void>
  stockIn: (id: number, data: { items: { voyageSupplyId: number; actualQuantity: number }[] }) => Promise<void>
}

export const useVoyageStore = create<VoyageState>((set) => ({
  voyages: [],
  loading: false,
  current: null,
  supplies: [],
  fetchVoyages: async () => {
    set({ loading: true })
    try {
      const voyages = await voyageApi.list()
      set({ voyages, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  fetchVoyage: async (id) => {
    set({ loading: true })
    try {
      const voyage = await voyageApi.get(id)
      set({ current: voyage, supplies: voyage.voyageSupplies ?? [], loading: false })
    } catch {
      set({ loading: false })
    }
  },
  createVoyage: async (data) => {
    await voyageApi.create(data)
  },
  updateVoyage: async (id, data) => {
    await voyageApi.update(id, data)
  },
  deleteVoyage: async (id) => {
    await voyageApi.delete(id)
  },
  addSupplies: async (id, data) => {
    await voyageApi.addSupplies(id, data)
  },
  stockIn: async (id, data) => {
    await voyageApi.stockIn(id, data)
  },
}))
