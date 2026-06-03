import { create } from 'zustand'
import {
  warehouseApi, categoryApi, memberApi, projectApi, supplyApi, demandListApi,
  type Warehouse, type Category, type Member, type Project, type Supply, type DemandListItem,
} from '@/api/client'

interface BaseDataState {
  warehouses: Warehouse[]
  categories: Category[]
  supplies: Supply[]
  members: Member[]
  projects: Project[]
  demandItems: DemandListItem[]
  loading: boolean
  fetchWarehouses: () => Promise<void>
  createWarehouse: (data: Partial<Warehouse>) => Promise<void>
  updateWarehouse: (id: number, data: Partial<Warehouse>) => Promise<void>
  deleteWarehouse: (id: number) => Promise<void>
  fetchCategories: () => Promise<void>
  fetchCategoryTree: () => Promise<void>
  createCategory: (data: Partial<Category>) => Promise<void>
  updateCategory: (id: number, data: Partial<Category>) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  fetchSupplies: () => Promise<void>
  createSupply: (data: Partial<Supply>) => Promise<void>
  updateSupply: (id: number, data: Partial<Supply>) => Promise<void>
  deleteSupply: (id: number) => Promise<void>
  fetchMembers: () => Promise<void>
  createMember: (data: Partial<Member>) => Promise<void>
  updateMember: (id: number, data: Partial<Member>) => Promise<void>
  deleteMember: (id: number) => Promise<void>
  fetchProjects: () => Promise<void>
  createProject: (data: Partial<Project>) => Promise<void>
  updateProject: (id: number, data: Partial<Project>) => Promise<void>
  deleteProject: (id: number) => Promise<void>
  fetchDemand: (voyageId: number) => Promise<void>
  updateDemandItem: (id: number, data: Partial<DemandListItem>) => Promise<void>
  generateDemand: () => Promise<void>
}

export const useBaseDataStore = create<BaseDataState>((set) => ({
  warehouses: [],
  categories: [],
  supplies: [],
  members: [],
  projects: [],
  demandItems: [],
  loading: false,
  fetchWarehouses: async () => {
    set({ loading: true })
    try {
      const warehouses = await warehouseApi.list()
      set({ warehouses, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  createWarehouse: async (data) => { await warehouseApi.create(data) },
  updateWarehouse: async (id, data) => { await warehouseApi.update(id, data) },
  deleteWarehouse: async (id) => { await warehouseApi.delete(id) },
  fetchCategories: async () => {
    set({ loading: true })
    try {
      const categories = await categoryApi.list()
      set({ categories, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  fetchCategoryTree: async () => {
    set({ loading: true })
    try {
      const categories = await categoryApi.tree()
      set({ categories, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  createCategory: async (data) => { await categoryApi.create(data) },
  updateCategory: async (id, data) => { await categoryApi.update(id, data) },
  deleteCategory: async (id) => { await categoryApi.delete(id) },
  fetchSupplies: async () => {
    set({ loading: true })
    try {
      const supplies = await supplyApi.list()
      set({ supplies, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  createSupply: async (data) => { await supplyApi.create(data) },
  updateSupply: async (id, data) => { await supplyApi.update(id, data) },
  deleteSupply: async (id) => { await supplyApi.delete(id) },
  fetchMembers: async () => {
    set({ loading: true })
    try {
      const members = await memberApi.list()
      set({ members, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  createMember: async (data) => { await memberApi.create(data) },
  updateMember: async (id, data) => { await memberApi.update(id, data) },
  deleteMember: async (id) => { await memberApi.delete(id) },
  fetchProjects: async () => {
    set({ loading: true })
    try {
      const projects = await projectApi.list()
      set({ projects, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  createProject: async (data) => { await projectApi.create(data) },
  updateProject: async (id, data) => { await projectApi.update(id, data) },
  deleteProject: async (id) => { await projectApi.delete(id) },
  fetchDemand: async (voyageId) => {
    try {
      const demandItems = await demandListApi.findByVoyage(voyageId)
      set({ demandItems })
    } catch {
      set({ demandItems: [] })
    }
  },
  updateDemandItem: async (id, data) => { await demandListApi.updateItem(id, data) },
  generateDemand: async () => { await demandListApi.generate() },
}))
