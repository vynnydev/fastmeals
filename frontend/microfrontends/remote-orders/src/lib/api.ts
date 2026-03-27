import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { Order, Product, DeliveryPerson, ApiError } from '@/types'

// Em dev, o Vite proxy redireciona /api/* para o API Gateway
// Em prod, usa a URL direta do API Gateway
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — injeta token do localStorage (compartilhado com shell)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('fastmeals_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — redireciona para /login em 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('fastmeals_token')
        localStorage.removeItem('fastmeals_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ============================================
// ORDERS API
// ============================================

export const ordersApi = {
  getAll: async (params?: {
    status?: string
    page?: number
    limit?: number
  }): Promise<Order[]> => {
    const response = await api.get('/api/orders', { params })
    const result = response.data
    return Array.isArray(result) ? result : result.data || []
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/api/orders/${id}`)
    return response.data
  },

  create: async (data: any): Promise<Order> => {
    const response = await api.post<Order>('/api/orders', data)
    return response.data
  },

  updateStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.patch<Order>(`/api/orders/${id}/status`, { status })
    return response.data
  },

  assignDelivery: async (orderId: string, deliveryPersonId: string): Promise<Order> => {
    const response = await api.patch<Order>(`/api/orders/${orderId}/assign`, {
      deliveryPersonId,
    })
    return response.data
  },

  cancel: async (id: string): Promise<Order> => {
    const response = await api.patch<Order>(`/api/orders/${id}/status`, { status: 'cancelled' })
    return response.data
  },
}

// ============================================
// PRODUCTS API (for order creation modal)
// ============================================

export const productsApi = {
  getAll: async (params?: { category?: string; available?: boolean; search?: string }): Promise<Product[]> => {
    const response = await api.get('/api/products', { params })
    const result = response.data
    return Array.isArray(result) ? result : result.data || []
  },
}

// ============================================
// DELIVERY API (for driver assignment in order detail)
// ============================================

export const deliveryApi = {
  getAll: async (params?: { status?: string; active?: boolean; available?: boolean }): Promise<DeliveryPerson[]> => {
    const response = await api.get('/api/delivery-persons', { params })
    const result = response.data
    return Array.isArray(result) ? result : result.data || []
  },

  getById: async (id: string): Promise<DeliveryPerson> => {
    const response = await api.get<DeliveryPerson>(`/api/delivery-persons/${id}`)
    return response.data
  },
}

export default api