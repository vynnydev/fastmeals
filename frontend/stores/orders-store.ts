import { create } from 'zustand'
import type { Order, OrderStatus, ViewMode } from '@/types'
import { ordersApi } from '@/lib/api'

interface OrdersState {
  orders: Order[]
  selectedOrder: Order | null
  isLoading: boolean
  error: string | null
  viewMode: ViewMode
  filters: {
    status: OrderStatus | 'all'
    search: string
    dateRange: { start: string | null; end: string | null }
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }

  // Actions
  fetchOrders: () => Promise<void>
  fetchOrderById: (id: string) => Promise<void>
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>
  assignDelivery: (orderId: string, deliveryPersonId: string) => Promise<void>
  setViewMode: (mode: ViewMode) => void
  setFilters: (filters: Partial<OrdersState['filters']>) => void
  setPage: (page: number) => void
  setSelectedOrder: (order: Order | null) => void
  updateOrderInList: (order: Order) => void
  clearError: () => void
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  viewMode: 'table',
  filters: {
    status: 'all',
    search: '',
    dateRange: { start: null, end: null },
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  fetchOrders: async () => {
    const { filters, pagination } = get()
    set({ isLoading: true, error: null })

    try {
      const params: Record<string, unknown> = {
        page: pagination.page,
        limit: pagination.limit,
      }

      if (filters.status !== 'all') {
        params.status = filters.status
      }

      if (filters.dateRange.start) {
        params.start_date = filters.dateRange.start
      }

      if (filters.dateRange.end) {
        params.end_date = filters.dateRange.end
      }

      const orders = await ordersApi.getAll(params as Parameters<typeof ordersApi.getAll>[0])

      set({
        orders: Array.isArray(orders) ? orders : [],
        pagination: {
          ...pagination,
          total: Array.isArray(orders) ? orders.length : 0,
          totalPages: 1,
        },
        isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar pedidos'
      set({ error: errorMessage, isLoading: false })
    }
  },

  fetchOrderById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const order = await ordersApi.getById(id)
      set({ selectedOrder: order, isLoading: false })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar pedido'
      set({ error: errorMessage, isLoading: false })
    }
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    try {
      const updatedOrder = await ordersApi.updateStatus(id, status)
      get().updateOrderInList(updatedOrder)
      
      if (get().selectedOrder?.id === id) {
        set({ selectedOrder: updatedOrder })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar status'
      set({ error: errorMessage })
      throw error
    }
  },

  assignDelivery: async (orderId: string, deliveryPersonId: string) => {
    try {
      const updatedOrder = await ordersApi.assignDelivery(orderId, deliveryPersonId)
      get().updateOrderInList(updatedOrder)
      
      if (get().selectedOrder?.id === orderId) {
        set({ selectedOrder: updatedOrder })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atribuir entregador'
      set({ error: errorMessage })
      throw error
    }
  },

  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode })
  },

  setFilters: (newFilters: Partial<OrdersState['filters']>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 }, // Reset to first page on filter change
    }))
  },

  setPage: (page: number) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }))
  },

  setSelectedOrder: (order: Order | null) => {
    set({ selectedOrder: order })
  },

  updateOrderInList: (updatedOrder: Order) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      ),
    }))
  },

  clearError: () => {
    set({ error: null })
  },
}))
