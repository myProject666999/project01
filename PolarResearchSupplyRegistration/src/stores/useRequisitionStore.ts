import { create } from 'zustand'
import { requisitionApi, type Requisition } from '@/api/client'

interface RequisitionState {
  requisitions: Requisition[]
  loading: boolean
  current: Requisition | null
  fetchRequisitions: () => Promise<void>
  fetchRequisition: (id: number) => Promise<void>
  createRequisition: (data: { memberId: number; projectId?: number; purposeType?: string; remark?: string; items: { supplyId: number; quantity: number }[] }) => Promise<void>
  approve: (id: number, data: { approvedBy: number }) => Promise<void>
  reject: (id: number, data: { approvedBy: number; remark?: string }) => Promise<void>
}

export const useRequisitionStore = create<RequisitionState>((set) => ({
  requisitions: [],
  loading: false,
  current: null,
  fetchRequisitions: async () => {
    set({ loading: true })
    try {
      const requisitions = await requisitionApi.list()
      set({ requisitions, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  fetchRequisition: async (id) => {
    set({ loading: true })
    try {
      const req = await requisitionApi.get(id)
      set({ current: req, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  createRequisition: async (data) => {
    await requisitionApi.create(data)
  },
  approve: async (id, data) => {
    await requisitionApi.approve(id, data)
  },
  reject: async (id, data) => {
    await requisitionApi.reject(id, data)
  },
}))
