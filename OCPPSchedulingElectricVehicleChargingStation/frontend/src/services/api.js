import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (phone, password) => api.post('/auth/login', { phone, password }),
  register: (phone, password, nickname) => api.post('/auth/register', { phone, password, nickname }),
  getProfile: () => api.get('/user/profile'),
};

export const stationAPI = {
  getStations: () => api.get('/stations'),
  getChargePoints: (stationId) => api.get(`/stations/${stationId}/charge-points`),
  scanQR: (qrCode) => api.post('/scan', { qr_code: qrCode }),
};

export const chargeAPI = {
  reserve: (connectorId) => api.post('/charge/reserve', { connector_id: connectorId }),
  startCharge: (connectorId) => api.post('/charge/start', { connector_id: connectorId }),
  stopCharge: (transactionId) => api.post('/charge/stop', { transaction_id: transactionId }),
  getTransaction: (transactionId) => api.get(`/charge/transaction/${transactionId}`),
  getTransactions: () => api.get('/charge/transactions'),
};

export const paymentAPI = {
  pay: (transactionId) => api.post('/payment/pay', { transaction_id: transactionId }),
  recharge: (amount) => api.post('/payment/recharge', { amount }),
  getBalance: () => api.get('/payment/balance'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getChargePoints: () => api.get('/dashboard/charge-points'),
};

export default api;
