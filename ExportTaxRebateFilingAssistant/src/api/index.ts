export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
  totalPages: number
}

export interface CustomsDeclaration {
  id: number
  declarationNo: string
  hsCode: string
  productName: string
  quantity: number
  unit: string
  amountUsd: number
  amountCny: number
  currency: string
  exportDate: string
  status: string
  createdAt: string
}

export interface VatInvoice {
  id: number
  invoiceNo: string
  invoiceCode: string
  productName: string
  quantity: number
  unit: string
  amount: number
  taxAmount: number
  sellerName: string
  sellerTaxNo: string
  invoiceDate: string
  status: string
  createdAt: string
}

export interface MatchingResult {
  id: number
  customsId: number
  invoiceId: number
  matchScore: number
  matchType: 'AUTO' | 'MANUAL'
  status: 'MATCHED' | 'SUSPECTED' | 'REJECTED' | 'PENDING'
  remark: string | null
  confirmedBy: number | null
  confirmedAt: string | null
  createdAt: string
}

export interface MatchingRule {
  id: number
  ruleName: string
  nameSimilarityThreshold: number
  amountToleranceRate: number
  quantityToleranceRate: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export type MatchingRules = MatchingRule

export interface TaxRate {
  id: number
  hsCode: string
  productName: string
  taxRate: number
  category: string
  effectiveDate: string
  createdAt: string
}

export interface Declaration {
  id: number
  declarationNo: string
  period: string
  totalAmount: number
  totalTaxAmount: number
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWING' | 'APPROVED' | 'REJECTED'
  createdBy: string | null
  submittedAt: string | null
  createdAt: string
}

export interface DeclarationDetail {
  id: number
  declarationId: number
  matchingId: number
  hsCode: string
  productName: string
  invoiceAmount: number
  taxRate: number
  taxAmount: number
  sortOrder: number
}

export interface DeclarationProgressItem {
  id: number
  declarationId: number
  stepName: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
  remark: string | null
  operatorId: number | null
  operatedAt: string | null
  createdAt: string
}

export interface DashboardData {
  customsCount: number
  invoiceCount: number
  matchedCount: number
  totalRebateAmount: number
  todoItems: TodoItem[]
  matchingStatus: MatchingStatusItem[]
}

export interface TodoItem {
  id: number
  title: string
  type: string
  createdAt: string
}

export interface MatchingStatusItem {
  name: string
  value: number
  color: string
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || `请求失败: ${response.status}`)
  }

  const text = await response.text()
  if (!text) return {} as T

  const json = JSON.parse(text)
  if (json.code !== undefined && json.code !== 0 && json.code !== 200) {
    throw new Error(json.message || '请求失败')
  }

  return json.data !== undefined ? json.data : json
}

function buildQuery(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export const customsApi = {
  list: (params?: { page?: number; size?: number; keyword?: string }) =>
    request<PageResult<CustomsDeclaration>>(`/api/customs-declarations${buildQuery(params || {})}`),
  import: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<{ count: number }>('/api/customs-declarations/import', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },
  get: (id: number) => request<CustomsDeclaration>(`/api/customs-declarations/${id}`),
  delete: (id: number) => request<void>(`/api/customs-declarations/${id}`, { method: 'DELETE' }),
}

export const invoiceApi = {
  list: (params?: { page?: number; size?: number; keyword?: string }) =>
    request<PageResult<VatInvoice>>(`/api/vat-invoices${buildQuery(params || {})}`),
  import: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<{ count: number }>('/api/vat-invoices/import', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },
  get: (id: number) => request<VatInvoice>(`/api/vat-invoices/${id}`),
  delete: (id: number) => request<void>(`/api/vat-invoices/${id}`, { method: 'DELETE' }),
}

export const matchingApi = {
  autoMatch: () => request<number>('/api/matching/auto', { method: 'POST' }),
  getResults: (params?: { page?: number; size?: number; keyword?: string }) =>
    request<PageResult<MatchingResult>>(`/api/matching/results${buildQuery(params || {})}`),
  getUnmatchedCustoms: () =>
    request<CustomsDeclaration[]>('/api/matching/unmatched/customs'),
  getUnmatchedInvoices: () =>
    request<VatInvoice[]>('/api/matching/unmatched/invoices'),
  manualMatch: (customsId: number, invoiceId: number) =>
    request<boolean>('/api/matching/manual', {
      method: 'POST',
      body: JSON.stringify({ customsId, invoiceId }),
    }),
  confirm: (id: number) => request<boolean>(`/api/matching/${id}/confirm`, { method: 'PUT' }),
  reject: (id: number) => request<boolean>(`/api/matching/${id}/reject`, { method: 'PUT' }),
  getRules: () => request<MatchingRules>('/api/matching/rules'),
  updateRules: (rules: MatchingRules) =>
    request<boolean>('/api/matching/rules', {
      method: 'PUT',
      body: JSON.stringify(rules),
    }),
}

export const taxRateApi = {
  list: (params?: { page?: number; size?: number; keyword?: string }) =>
    request<PageResult<TaxRate>>(`/api/tax-rates${buildQuery(params || {})}`),
  getByHsCode: (hsCode: string) => request<TaxRate>(`/api/tax-rates/${hsCode}`),
  create: (data: Omit<TaxRate, 'id'>) =>
    request<TaxRate>('/api/tax-rates', { method: 'POST', body: JSON.stringify(data) }),
  update: (hsCode: string, data: Partial<TaxRate>) =>
    request<TaxRate>(`/api/tax-rates/${hsCode}`, { method: 'PUT', body: JSON.stringify(data) }),
  importRates: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<{ count: number }>('/api/tax-rates/import', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },
  delete: (hsCode: string) => request<void>(`/api/tax-rates/${hsCode}`, { method: 'DELETE' }),
}

export const declarationApi = {
  generate: (period: string) =>
    request<Declaration>('/api/declarations/generate', {
      method: 'POST',
      body: JSON.stringify({ period }),
    }),
  list: (params?: { page?: number; size?: number; keyword?: string }) =>
    request<PageResult<Declaration>>(`/api/declarations${buildQuery(params || {})}`),
  get: (id: number) => request<Declaration>(`/api/declarations/${id}`),
  getDetails: (id: number) => request<DeclarationDetail[]>(`/api/declarations/${id}/details`),
  submit: (id: number) => request<boolean>(`/api/declarations/${id}/submit`, { method: 'PUT' }),
  updateStatus: (id: number, status: string) =>
    request<boolean>(`/api/declarations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  getProgress: (id: number) => request<DeclarationProgressItem[]>(`/api/declarations/${id}/progress`),
}

export const statsApi = {
  getDashboard: () => request<DashboardData>('/api/statistics/dashboard'),
  getMatchingStatus: () => request<MatchingStatusItem[]>('/api/statistics/matching-status'),
}

export const authApi = {
  login: (username: string, password: string) =>
    request<{ token: string; user: { id: number; username: string; realName: string; role: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
}
