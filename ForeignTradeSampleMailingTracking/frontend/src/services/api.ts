import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const samplesAPI = {
  getAll: () => api.get('/samples'),
  getOne: (id: number) => api.get(`/samples/${id}`),
  create: (data: any) => api.post('/samples', data),
  update: (id: number, data: any) => api.put(`/samples/${id}`, data),
  delete: (id: number) => api.delete(`/samples/${id}`),
};

export const customersAPI = {
  getAll: () => api.get('/customers'),
  getOne: (id: number) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: number, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

export const couriersAPI = {
  getAll: () => api.get('/couriers'),
};

export const mailingsAPI = {
  getAll: () => api.get('/mailings'),
  getOne: (id: number) => api.get(`/mailings/${id}`),
  create: (data: any) => api.post('/mailings', data),
  update: (id: number, data: any) => api.put(`/mailings/${id}`, data),
  delete: (id: number) => api.delete(`/mailings/${id}`),
  updateStatus: (id: number, status: string) => api.put(`/mailings/${id}/status`, { status }),
};

export const feedbacksAPI = {
  getAll: () => api.get('/feedbacks'),
  getByMailingId: (mailingId: number) => api.get(`/feedbacks/mailing/${mailingId}`),
  create: (data: any) => api.post('/feedbacks', data),
  update: (id: number, data: any) => api.put(`/feedbacks/${id}`, data),
  delete: (id: number) => api.delete(`/feedbacks/${id}`),
};

export const trackingAPI = {
  getLogs: (mailingId: number) => api.get(`/tracking/${mailingId}`),
  poll: () => api.post('/tracking/poll'),
};

export const roiAPI = {
  getSampleROI: () => api.get('/roi/samples'),
  getDashboard: () => api.get('/roi/dashboard'),
};

export default api;
