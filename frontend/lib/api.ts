import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type {
  LoginRequest,
  LoginResponse,
  Product,
  ProductCreateRequest,
  Order,
  DeliveryPerson,
  DeliveryPersonCreateRequest,
  DeliveryPersonUpdateRequest,
  OptimizationResponse,
  ReportFilters,
  PaginatedResponse,
  ApiError,
} from '@/types'

// Base URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('fastmeals_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Handle 401 and errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Don't redirect if already on login page
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('fastmeals_token')
          localStorage.removeItem('fastmeals_user')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// ============================================
// AUTH API
// ============================================

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', data)
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/refresh-token', { refreshToken })
    return response.data
  },
}

// ============================================
// PRODUCTS API
// ============================================

export const productsApi = {
  getAll: async (params?: { category?: string; available?: boolean; search?: string }): Promise<Product[]> => {
    const response = await api.get('/api/products', { params })
    const result = response.data
    return Array.isArray(result) ? result : result.data || []
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/api/products/${id}`)
    return response.data
  },

  create: async (data: ProductCreateRequest): Promise<Product> => {
    const response = await api.post<Product>('/api/products', data)
    return response.data
  },

  update: async (id: string, data: Partial<ProductCreateRequest>): Promise<Product> => {
    const response = await api.put<Product>(`/api/products/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/products/${id}`)
  },

  // Toggle availability using PUT (no dedicated endpoint)
  toggleAvailability: async (id: string): Promise<Product> => {
    const product = await productsApi.getById(id)
    const isAvailable = product.isAvailable ?? product.is_available
    const response = await api.put<Product>(`/api/products/${id}`, { isAvailable: !isAvailable })
    return response.data
  },
}

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

  // Fixed: PATCH instead of POST, deliveryPersonId instead of delivery_person_id
  assignDelivery: async (orderId: string, deliveryPersonId: string): Promise<Order> => {
    const response = await api.patch<Order>(`/api/orders/${orderId}/assign`, {
      deliveryPersonId,
    })
    return response.data
  },

  // Cancel using status update (no dedicated cancel endpoint)
  cancel: async (id: string): Promise<Order> => {
    const response = await api.patch<Order>(`/api/orders/${id}/status`, { status: 'cancelled' })
    return response.data
  },
}

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
// OPTIMIZATION API
// ============================================

export const optimizationApi = {
  // Fixed: correct endpoint path
  getSuggestions: async (): Promise<OptimizationResponse> => {
    const response = await api.post<OptimizationResponse>('/api/orders/optimize-assignment')
    return response.data
  },

  // Apply assignment using existing endpoints
  applyAssignment: async (orderId: string, deliveryPersonId: string): Promise<Order> => {
    // 1. Assign delivery person
    await api.patch(`/api/orders/${orderId}/assign`, { deliveryPersonId })
    // 2. Update status to delivering
    const response = await api.patch<Order>(`/api/orders/${orderId}/status`, { status: 'delivering' })
    return response.data
  },
}

// ============================================
// REPORTS API
// ============================================

export const reportsApi = {
  getRevenueByPeriod: async (filters: ReportFilters) => {
    const response = await api.get('/api/reports/revenue', { params: filters })
    return response.data
  },

  getOrdersByStatus: async () => {
    const response = await api.get('/api/reports/orders-by-status')
    return response.data
  },

  getTopProducts: async (filters?: ReportFilters & { limit?: number }) => {
    const response = await api.get('/api/reports/top-products', { params: filters })
    return response.data
  },

  // Fixed: correct endpoint name
  getAverageDeliveryTime: async () => {
    const response = await api.get('/api/reports/average-delivery-time')
    return response.data
  },

  getAIInsights: async (filters: ReportFilters) => {
    const response = await api.get('/api/reports/ai-insights', { params: filters })
    return response.data
  },

  // Dashboard metrics: consolidate from all report endpoints
  getDashboardMetrics: async () => {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
    const endDate = now.toISOString().split('T')[0]

    const [revenue, ordersByStatus, topProducts, deliveryTime] = await Promise.all([
      reportsApi.getRevenueByPeriod({ startDate, endDate }).catch(() => ({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 })),
      reportsApi.getOrdersByStatus().catch(() => ({ data: [], total: 0 })),
      reportsApi.getTopProducts({ limit: 5 }).catch(() => ({ data: [] })),
      reportsApi.getAverageDeliveryTime().catch(() => ({ averageMinutes: 0, totalDelivered: 0 })),
    ])

    return {
      revenue,
      ordersByStatus,
      topProducts,
      deliveryTime,
    }
  },
}

export default api