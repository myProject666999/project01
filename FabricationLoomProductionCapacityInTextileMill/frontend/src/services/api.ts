import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const loomApi = {
  getList: (params?: { page?: number; pageSize?: number; status?: number }) =>
    api.get('/looms', { params }),
  getOne: (id: number) => api.get(`/looms/${id}`),
  getRealtime: (id: number) => api.get(`/looms/${id}/realtime`),
  getAllRealtime: () => api.get('/looms/all/realtime'),
  getCompatible: (specId: number) => api.get(`/looms/compatible/${specId}`),
  create: (data: any) => api.post('/looms', data),
  update: (id: number, data: any) => api.put(`/looms/${id}`, data),
};

export const dataApi = {
  collectPlc: (data: any) => api.post('/data/plc', data),
  collectBatch: (data: any[]) => api.post('/data/plc/batch', data),
  getHistory: (loomId: number, params?: { startTime?: string; endTime?: string }) =>
    api.get(`/data/history/${loomId}`, { params }),
  simulate: (loomId?: number) => api.post('/data/simulate', { loomId }),
  aggregate: () => api.post('/data/aggregate'),
};

export const oeeApi = {
  getStats: (params?: {
    loomId?: number;
    shiftId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) => api.get('/oee', { params }),
  getSummary: (params: { startDate: string; endDate: string; loomId?: number }) =>
    api.get('/oee/summary', { params }),
  calculate: (data: { loomId: number; shiftId: number; statDate: string }) =>
    api.post('/oee/calculate', data),
  calculateAll: () => api.post('/oee/calculate-all'),
};

export const shiftReportApi = {
  getList: (params?: {
    loomId?: number;
    shiftId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) => api.get('/shift-reports', { params }),
  getOne: (id: number) => api.get(`/shift-reports/${id}`),
  update: (id: number, data: any) => api.put(`/shift-reports/${id}`, data),
  generate: (data: { loomId: number; shiftId: number; shiftDate: string }) =>
    api.post('/shift-reports/generate', data),
  generateAll: () => api.post('/shift-reports/generate-all'),
};

export const productionApi = {
  getOrders: (params?: {
    status?: number;
    urgency?: number;
    page?: number;
    pageSize?: number;
  }) => api.get('/production/orders', { params }),
  getOrder: (id: number) => api.get(`/production/orders/${id}`),
  createOrder: (data: any) => api.post('/production/orders', data),
  updateOrder: (id: number, data: any) => api.put(`/production/orders/${id}`, data),
  getRecommendations: (orderId: number) =>
    api.get(`/production/orders/${orderId}/recommendations`),
  scheduleOrder: (orderId: number, loomIds: number[]) =>
    api.post(`/production/orders/${orderId}/schedule`, { loomIds }),
  getSchedules: (params?: {
    orderId?: number;
    loomId?: number;
    status?: number;
    page?: number;
    pageSize?: number;
  }) => api.get('/production/schedules', { params }),
  updateProgress: (scheduleId: number, completedLength: number) =>
    api.put(`/production/schedules/${scheduleId}/progress`, { completedLength }),
  getAllQueues: () => api.get('/production/queues'),
  getLoomQueue: (loomId: number) => api.get(`/production/queues/${loomId}`),
};

export const maintenanceApi = {
  getPlans: () => api.get('/maintenance/plans'),
  createPlan: (data: any) => api.post('/maintenance/plans', data),
  updatePlan: (id: number, data: any) => api.put(`/maintenance/plans/${id}`, data),
  getOrders: (params?: {
    loomId?: number;
    status?: number;
    maintenanceType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) => api.get('/maintenance/orders', { params }),
  getOrder: (id: number) => api.get(`/maintenance/orders/${id}`),
  createManualOrder: (data: {
    loomId: number;
    maintenanceType: string;
    scheduledDate?: string;
    operator?: string;
  }) => api.post('/maintenance/orders', data),
  updateOrder: (id: number, data: any) => api.put(`/maintenance/orders/${id}`, data),
  startOrder: (id: number, operator?: string) =>
    api.post(`/maintenance/orders/${id}/start`, { operator }),
  completeOrder: (id: number, data: {
    maintenanceContent: string;
    checkResults?: any[];
    replacedParts?: any[];
    remark?: string;
  }) => api.post(`/maintenance/orders/${id}/complete`, data),
  cancelOrder: (id: number, remark?: string) =>
    api.post(`/maintenance/orders/${id}/cancel`, { remark }),
  checkAndGenerate: () => api.post('/maintenance/check'),
  getSummary: (params: { startDate: string; endDate: string }) =>
    api.get('/maintenance/summary', { params }),
  getDueLooms: () => api.get('/maintenance/due'),
};

export const downtimeApi = {
  getReasons: () => api.get('/downtime/reasons'),
  createReason: (data: any) => api.post('/downtime/reasons', data),
  getRecords: (params?: {
    loomId?: number;
    reasonId?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) => api.get('/downtime/records', { params }),
  getRecord: (id: number) => api.get(`/downtime/records/${id}`),
  startDowntime: (data: {
    loomId: number;
    reasonId: number;
    operator?: string;
    remark?: string;
  }) => api.post('/downtime/records/start', data),
  endDowntime: (id: number, remark?: string) =>
    api.post(`/downtime/records/${id}/end`, { remark }),
  updateRecord: (id: number, data: any) => api.put(`/downtime/records/${id}`, data),
  getSummary: (params: { startDate: string; endDate: string; loomId?: number }) =>
    api.get('/downtime/summary', { params }),
};

export default api;
