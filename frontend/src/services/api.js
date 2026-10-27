/**
 * REST API Client Service
 * Connects Frontend React application to Node/Express backend.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('smart_grid_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.errors = data.errors || [];
    throw err;
  }
  return data;
};

export const api = {
  // Authentication
  login: async (credentials) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  changePassword: async (passwords) => {
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(passwords),
    });
    return handleResponse(res);
  },

  // Dashboard
  getDashboardSummary: async () => {
    const res = await fetch(`${BASE_URL}/dashboard/summary`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Consumers
  getConsumers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/consumers?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getConsumerById: async (id) => {
    const res = await fetch(`${BASE_URL}/consumers/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createConsumer: async (consumerData) => {
    const res = await fetch(`${BASE_URL}/consumers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(consumerData),
    });
    return handleResponse(res);
  },

  updateConsumer: async (id, consumerData) => {
    const res = await fetch(`${BASE_URL}/consumers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(consumerData),
    });
    return handleResponse(res);
  },

  deleteConsumer: async (id) => {
    const res = await fetch(`${BASE_URL}/consumers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Smart Meters
  getMeters: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/meters?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createMeter: async (meterData) => {
    const res = await fetch(`${BASE_URL}/meters`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(meterData),
    });
    return handleResponse(res);
  },

  updateMeter: async (id, meterData) => {
    const res = await fetch(`${BASE_URL}/meters/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(meterData),
    });
    return handleResponse(res);
  },

  // Meter Readings
  getReadings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/readings?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getLatestMeterReading: async (meterId) => {
    const res = await fetch(`${BASE_URL}/readings/meter/${meterId}/latest`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createReading: async (readingData) => {
    const res = await fetch(`${BASE_URL}/readings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(readingData),
    });
    return handleResponse(res);
  },

  // Tariff Slabs
  getTariffs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/tariffs?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createTariff: async (tariffData) => {
    const res = await fetch(`${BASE_URL}/tariffs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(tariffData),
    });
    return handleResponse(res);
  },

  updateTariff: async (id, tariffData) => {
    const res = await fetch(`${BASE_URL}/tariffs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(tariffData),
    });
    return handleResponse(res);
  },

  deleteTariff: async (id) => {
    const res = await fetch(`${BASE_URL}/tariffs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Bills
  getBills: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/bills?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getBillById: async (id) => {
    const res = await fetch(`${BASE_URL}/bills/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  generateBill: async (billData) => {
    const res = await fetch(`${BASE_URL}/bills/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(billData),
    });
    return handleResponse(res);
  },

  // Payments
  getPayments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/payments?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  recordPayment: async (paymentData) => {
    const res = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData),
    });
    return handleResponse(res);
  },

  // Reports
  getMonthlyConsumptionReport: async () => {
    const res = await fetch(`${BASE_URL}/reports/monthly-consumption`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getMonthlyRevenueReport: async () => {
    const res = await fetch(`${BASE_URL}/reports/monthly-revenue`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getOutstandingBillsReport: async () => {
    const res = await fetch(`${BASE_URL}/reports/outstanding-bills`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getCategoryBreakdownReport: async () => {
    const res = await fetch(`${BASE_URL}/reports/category-breakdown`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/audit?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
