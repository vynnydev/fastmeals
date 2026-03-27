import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type {
  DeliveryPerson,
  DeliveryPersonCreateRequest,
  DeliveryPersonUpdateRequest,
  Order,
  OptimizationResponse,
  ApiError,
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

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
// DELIVERY PERSONS API
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

  create: async (data: DeliveryPersonCreateRequest): Promise<DeliveryPerson> => {
    const response = await api.post<DeliveryPerson>('/api/delivery-persons', data)
    return response.data
  },

  update: async (id: string, data: Partial<DeliveryPersonUpdateRequest>): Promise<DeliveryPerson> => {
    const response = await api.put<DeliveryPerson>(`/api/delivery-persons/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/delivery-persons/${id}`)
  },
}

// ============================================
// ORDERS API (for kanban and optimization)
// ============================================

export const ordersApi = {
  getAll: async (params?: { status?: string }): Promise<Order[]> => {
    const response = await api.get('/api/orders', { params })
    const result = response.data
    return Array.isArray(result) ? result : result.data || []
  },
}

// ============================================
// OPTIMIZATION API
// ============================================

export const optimizationApi = {
  getSuggestions: async (): Promise<OptimizationResponse> => {
    const response = await api.post<OptimizationResponse>('/api/orders/optimize-assignment')
    return response.data
  },

  applyAssignment: async (orderId: string, deliveryPersonId: string): Promise<Order> => {
    await api.patch(`/api/orders/${orderId}/assign`, { deliveryPersonId })
    const response = await api.patch<Order>(`/api/orders/${orderId}/status`, { status: 'delivering' })
    return response.data
  },
}

export default api