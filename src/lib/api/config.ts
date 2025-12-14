// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Authentication
  FACE_LOGIN: '/users/face-login',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  PRODUCT_BY_BARCODE: (barcode: string) => `/products/barcode/${barcode}`,
  
  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  USER_ORDERS: (userId: number) => `/orders/user/${userId}`,
  
  // Users
  USERS: '/users',
  USER_BY_ID: (id: number) => `/users/${id}`,
} as const;

