const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = {
  // Auth
  register: (data) => fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),

  login: (data) => fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),

  getProfile: (token) => fetch(`${API_BASE_URL}/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  }).then(r => r.json()),

  // Menu
  getMenu: (category = null) => {
    const url = category ? `${API_BASE_URL}/menu?category=${category}` : `${API_BASE_URL}/menu`;
    return fetch(url).then(r => r.json());
  },

  getCategories: () => fetch(`${API_BASE_URL}/menu/categories`).then(r => r.json()),

  // Orders
  createOrder: (data, token) => fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }).then(r => r.json()),

  getOrder: (orderId, token) => fetch(`${API_BASE_URL}/orders/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  }).then(r => r.json()),

  getUserOrders: (token) => fetch(`${API_BASE_URL}/orders`, {
    headers: { 'Authorization': `Bearer ${token}` },
  }).then(r => r.json()),

  confirmOrder: (orderId, token) => fetch(`${API_BASE_URL}/orders/${orderId}/confirm`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  }).then(r => r.json()),

  cancelOrder: (orderId, reason, token) => fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  }).then(r => r.json()),

  // Queue
  getQueueStatus: (orderId, token) => fetch(`${API_BASE_URL}/queue/status/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  }).then(r => r.json()),

  // Payments
  initiatePayment: (orderId, token) => fetch(`${API_BASE_URL}/payments/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId }),
  }).then(r => r.json()),

  verifyPayment: (data, token) => fetch(`${API_BASE_URL}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }).then(r => r.json()),

  payWithWallet: (orderId, token) => fetch(`${API_BASE_URL}/payments/wallet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId }),
  }).then(r => r.json()),
};
