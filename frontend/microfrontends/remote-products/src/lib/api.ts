import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { Product, ProductCreateRequest, ApiError } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
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

  toggleAvailability: async (id: string): Promise<Product> => {
    const product = await productsApi.getById(id)
    const isAvailable = product.isAvailable ?? product.is_available
    const response = await api.put<Product>(`/api/products/${id}`, { isAvailable: !isAvailable })
    return response.data
  },
}

export default api