import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type {
  LoginRequest,
  LoginResponse,
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  Order,
  OrderCreateRequest,
  OrderStatusUpdateRequest,
  DeliveryPerson,
  DeliveryPersonCreateRequest,
  DeliveryPersonUpdateRequest,
  Delivery,
  OptimizationRequest,
  OptimizationResponse,
  ReportFilters,
  ReportSummary,
  DashboardMetrics,
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
      // Clear auth data and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fastmeals_token')
        localStorage.removeItem('fastmeals_user')
        window.location.href = '/login'
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

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout')
  },

  me: async () => {
    const response = await api.get('/api/auth/me')
    return response.data
  },
}

// ============================================
// PRODUCTS API
// ============================================

export const productsApi = {
  getAll: async (params?: { category?: string; available?: boolean }): Promise<Product[]> => {
    const response = await api.get<Product[]>('/api/products', { params })
    return response.data
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

  toggleAvailability: async (id: string): Promise<Product> => {
    const response = await api.patch<Product>(`/api/products/${id}/toggle-availability`)
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
    start_date?: string
    end_date?: string
  }): Promise<PaginatedResponse<Order>> => {
    const response = await api.get<PaginatedResponse<Order>>('/api/orders', { params })
    return response.data
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/api/orders/${id}`)
    return response.data
  },

  create: async (data: OrderCreateRequest): Promise<Order> => {
    const response = await api.post<Order>('/api/orders', data)
    return response.data
  },

  updateStatus: async (id: string, data: OrderStatusUpdateRequest): Promise<Order> => {
    const response = await api.patch<Order>(`/api/orders/${id}/status`, data)
    return response.data
  },

  assignDelivery: async (orderId: string, deliveryPersonId: string): Promise<Order> => {
    const response = await api.post<Order>(`/api/orders/${orderId}/assign`, {
      delivery_person_id: deliveryPersonId,
    })
    return response.data
  },

  cancel: async (id: string, reason?: string): Promise<Order> => {
    const response = await api.post<Order>(`/api/orders/${id}/cancel`, { reason })
    return response.data
  },
}

// ============================================
// DELIVERY PERSONS API
// ============================================

export const deliveryApi = {
  getAll: async (params?: { status?: string; active?: boolean }): Promise<DeliveryPerson[]> => {
    const response = await api.get<DeliveryPerson[]>('/api/delivery-persons', { params })
    return response.data
  },

  getDeliveries: async (params?: { status?: string }): Promise<Delivery[]> => {
    const response = await api.get<Delivery[]>('/api/deliveries', { params })
    return response.data
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

  updateStatus: async (id: string, status: string): Promise<DeliveryPerson> => {
    const response = await api.patch<DeliveryPerson>(`/api/delivery-persons/${id}/status`, { status })
    return response.data
  },

  updateLocation: async (id: string, lat: number, lng: number): Promise<DeliveryPerson> => {
    const response = await api.patch<DeliveryPerson>(`/api/delivery-persons/${id}/location`, {
      lat,
      lng,
    })
    return response.data
  },
}

// ============================================
// OPTIMIZATION API
// ============================================

export const optimizationApi = {
  getSuggestions: async (data?: OptimizationRequest): Promise<OptimizationResponse> => {
    const response = await api.post<OptimizationResponse>('/api/optimization/suggest', data)
    return response.data
  },

  applyAssignment: async (orderId: string, deliveryPersonId: string): Promise<Order> => {
    const response = await api.post<Order>('/api/optimization/apply', {
      order_id: orderId,
      delivery_person_id: deliveryPersonId,
    })
    return response.data
  },

  applyAll: async (assignments: { order_id: string; delivery_person_id: string }[]): Promise<{
    success: number
    failed: number
    results: Order[]
  }> => {
    const response = await api.post('/api/optimization/apply-all', { assignments })
    return response.data
  },
}

// ============================================
// REPORTS API
// ============================================

export const reportsApi = {
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response = await api.get<DashboardMetrics>('/api/reports/dashboard')
    return response.data
  },

  getSummary: async (filters: ReportFilters): Promise<ReportSummary> => {
    const response = await api.get<ReportSummary>('/api/reports/summary', { params: filters })
    return response.data
  },

  getRevenueByPeriod: async (filters: ReportFilters) => {
    const response = await api.get('/api/reports/revenue', { params: filters })
    return response.data
  },

  getOrdersByStatus: async (filters: ReportFilters) => {
    const response = await api.get('/api/reports/orders-by-status', { params: filters })
    return response.data
  },

  getTopProducts: async (filters: ReportFilters & { limit?: number }) => {
    const response = await api.get('/api/reports/top-products', { params: filters })
    return response.data
  },

  getDeliveryTimes: async (filters: ReportFilters) => {
    const response = await api.get('/api/reports/delivery-times', { params: filters })
    return response.data
  },

  getAIInsights: async (filters: ReportFilters) => {
    const response = await api.get('/api/reports/ai-insights', { params: filters })
    return response.data
  },
}

export default api
