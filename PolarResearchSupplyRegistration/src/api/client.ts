const BASE_URL = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message || `Request failed: ${res.status}`)
  }
  return res.json()
}

function get<T>(url: string, params?: Record<string, string | number | undefined>) {
  if (params) {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') sp.set(k, String(v)) })
    const qs = sp.toString()
    if (qs) url += `?${qs}`
  }
  return request<T>(url)
}

function post<T>(url: string, data?: unknown) {
  return request<T>(url, { method: 'POST', body: data ? JSON.stringify(data) : undefined })
}

function put<T>(url: string, data?: unknown) {
  return request<T>(url, { method: 'PUT', body: data ? JSON.stringify(data) : undefined })
}

function del<T>(url: string) {
  return request<T>(url, { method: 'DELETE' })
}

export const api = { get, post, put, del }

export interface Warehouse {
  id: number
  name: string
  location: string | null
  capacity: number
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  parentId: number | null
  description: string | null
  sortOrder: number
  children?: Category[]
  createdAt: string
  updatedAt: string
}

export interface Supply {
  id: number
  name: string
  categoryId: number
  unit: string
  calories: number | null
  shelfLifeDays: number | null
  description: string | null
  category?: Category
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: number
  supplyId: number
  warehouseId: number
  quantity: number
  reservedQuantity: number
  expiryDate: string | null
  batchNo: string | null
  lastStockIn: string | null
  lastStockOut: string | null
  supply?: Supply
  warehouse?: Warehouse
  createdAt: string
  updatedAt: string
}

export interface Voyage {
  id: number
  voyageNo: string
  shipName: string | null
  arrivalDate: string
  status: 'planned' | 'shipping' | 'arrived' | 'completed'
  description: string | null
  voyageSupplies?: VoyageSupply[]
  createdAt: string
  updatedAt: string
}

export interface VoyageSupply {
  id: number
  voyageId: number
  supplyId: number
  targetWarehouseId: number
  quantity: number
  actualQuantity: number | null
  status: 'pending' | 'stocked_in'
  supply?: Supply
  targetWarehouse?: Warehouse
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: number
  name: string
  leader: string | null
  description: string | null
  status: 'active' | 'completed' | 'suspended'
  createdAt: string
  updatedAt: string
}

export interface Member {
  id: number
  name: string
  role: 'station_chief' | 'logistics' | 'researcher'
  team: string | null
  phone: string | null
  projectId: number | null
  project?: Project
  createdAt: string
  updatedAt: string
}

export interface Requisition {
  id: number
  reqNo: string
  memberId: number
  projectId: number | null
  purposeType: 'personal' | 'project'
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  remark: string | null
  approvedBy: number | null
  approvedAt: string | null
  member?: Member
  project?: Project
  items?: RequisitionItem[]
  createdAt: string
  updatedAt: string
}

export interface RequisitionItem {
  id: number
  requisitionId: number
  supplyId: number
  quantity: number
  remark: string | null
  supply?: Supply
}

export interface InventoryRecord {
  id: number
  inventoryItemId: number
  type: 'in' | 'out'
  quantity: number
  sourceType: string | null
  sourceId: number | null
  remark: string | null
  createdAt: string
}

export interface Alert {
  id: number
  supplyId: number
  dailyConsumption: number
  daysRemaining: number | null
  level: 'critical' | 'warning' | 'notice'
  resolved: boolean
  supply?: Supply
  createdAt: string
  updatedAt: string
}

export interface DemandList {
  id: number
  name: string
  voyageId: number | null
  status: 'draft' | 'confirmed' | 'submitted'
  createdAt: string
  updatedAt: string
}

export interface DemandListItem {
  id: number
  demandListId: number
  supplyId: number
  requiredQuantity: number
  suggestedQuantity: number
  remark: string | null
  supply?: Supply
}

export interface Stocktaking {
  id: number
  taskNo: string
  scopeType: 'warehouse' | 'category' | 'all'
  scopeId: number | null
  status: 'pending' | 'in_progress' | 'completed' | 'approved'
  createdBy: number
  approvedBy: number | null
  approvedAt: string | null
  completedAt: string | null
  items?: StocktakingItem[]
  createdAt: string
  updatedAt: string
}

export interface StocktakingItem {
  id: number
  stocktakingId: number
  inventoryItemId: number
  bookQuantity: number
  actualQuantity: number | null
  difference: number | null
  remark: string | null
  inventoryItem?: InventoryItem
}

export interface DashboardStats {
  totalInventory: number
  alertCount: number
  monthlyRequisitions: number
  pendingStocktaking: number
}

export interface ConsumptionTrend {
  month: string
  inCount: number
  outCount: number
}

export const warehouseApi = {
  list: () => api.get<Warehouse[]>('/warehouses'),
  get: (id: number) => api.get<Warehouse>(`/warehouses/${id}`),
  create: (data: Partial<Warehouse>) => api.post<Warehouse>('/warehouses', data),
  update: (id: number, data: Partial<Warehouse>) => api.put<Warehouse>(`/warehouses/${id}`, data),
  delete: (id: number) => api.del<void>(`/warehouses/${id}`),
}

export const categoryApi = {
  list: () => api.get<Category[]>('/categories'),
  tree: () => api.get<Category[]>('/categories/tree'),
  get: (id: number) => api.get<Category>(`/categories/${id}`),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data),
  update: (id: number, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data),
  delete: (id: number) => api.del<void>(`/categories/${id}`),
}

export const supplyApi = {
  list: () => api.get<Supply[]>('/supplies'),
  get: (id: number) => api.get<Supply>(`/supplies/${id}`),
  create: (data: Partial<Supply>) => api.post<Supply>('/supplies', data),
  update: (id: number, data: Partial<Supply>) => api.put<Supply>(`/supplies/${id}`, data),
  delete: (id: number) => api.del<void>(`/supplies/${id}`),
}

export const inventoryApi = {
  list: (params?: Record<string, string | number | undefined>) => api.get<InventoryItem[]>('/inventory', params),
  get: (id: number) => api.get<InventoryItem>(`/inventory/${id}`),
  records: (id: number) => api.get<InventoryRecord[]>(`/inventory/${id}/records`),
}

export const voyageApi = {
  list: () => api.get<Voyage[]>('/voyages'),
  get: (id: number) => api.get<Voyage>(`/voyages/${id}`),
  create: (data: Partial<Voyage>) => api.post<Voyage>('/voyages', data),
  update: (id: number, data: Partial<Voyage>) => api.put<Voyage>(`/voyages/${id}`, data),
  delete: (id: number) => api.del<void>(`/voyages/${id}`),
  addSupplies: (id: number, data: { supplies: { supplyId: number; targetWarehouseId: number; quantity: number }[] }) => api.post('/voyages/' + id + '/supplies', data),
  stockIn: (id: number, data: { items: { voyageSupplyId: number; actualQuantity: number }[] }) => api.post('/voyages/' + id + '/stock-in', data),
}

export const projectApi = {
  list: () => api.get<Project[]>('/projects'),
  get: (id: number) => api.get<Project>(`/projects/${id}`),
  create: (data: Partial<Project>) => api.post<Project>('/projects', data),
  update: (id: number, data: Partial<Project>) => api.put<Project>(`/projects/${id}`, data),
  delete: (id: number) => api.del<void>(`/projects/${id}`),
}

export const memberApi = {
  list: () => api.get<Member[]>('/members'),
  get: (id: number) => api.get<Member>(`/members/${id}`),
  create: (data: Partial<Member>) => api.post<Member>('/members', data),
  update: (id: number, data: Partial<Member>) => api.put<Member>(`/members/${id}`, data),
  delete: (id: number) => api.del<void>(`/members/${id}`),
}

export const requisitionApi = {
  list: () => api.get<Requisition[]>('/requisitions'),
  get: (id: number) => api.get<Requisition>(`/requisitions/${id}`),
  create: (data: { memberId: number; projectId?: number; purposeType?: string; remark?: string; items: { supplyId: number; quantity: number }[] }) => api.post<Requisition>('/requisitions', data),
  approve: (id: number, data: { approvedBy: number }) => api.put<Requisition>(`/requisitions/${id}/approve`, data),
  reject: (id: number, data: { approvedBy: number; remark?: string }) => api.put<Requisition>(`/requisitions/${id}/reject`, data),
}

export const alertApi = {
  list: () => api.get<Alert[]>('/alerts'),
  calculate: () => api.post('/alerts/calculate'),
  resolve: (id: number) => api.post(`/alerts/${id}/resolve`),
}

export const stocktakingApi = {
  list: () => api.get<Stocktaking[]>('/stocktaking'),
  get: (id: number) => api.get<Stocktaking>(`/stocktaking/${id}`),
  create: (data: { scopeType?: string; scopeId?: number; createdBy: number }) => api.post<Stocktaking>('/stocktaking', data),
  updateItem: (id: number, itemId: number, data: { actualQuantity: number; remark?: string }) => api.put(`/stocktaking/${id}/items/${itemId}`, data),
  complete: (id: number) => api.post(`/stocktaking/${id}/complete`),
  approve: (id: number, data: { approvedBy: number }) => api.post(`/stocktaking/${id}/approve`, data),
}

export const demandListApi = {
  findByVoyage: (voyageId: number) => api.get<DemandListItem[]>(`/demand-list/voyage/${voyageId}`),
  updateItem: (id: number, data: Partial<DemandListItem>) => api.put(`/demand-list/items/${id}`, data),
  generate: () => api.post('/demand-list/generate'),
}

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/dashboard/stats'),
  alerts: () => api.get<Alert[]>('/dashboard/alerts'),
  trends: () => api.get<ConsumptionTrend[]>('/dashboard/trends'),
  recentVoyages: () => api.get<Voyage[]>('/dashboard/recent-voyages'),
}
