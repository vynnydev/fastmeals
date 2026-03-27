import { useEffect } from 'react'
import { useOrdersStore } from '@/stores/orders-store'

export function useOrders() {
  const store = useOrdersStore()

  useEffect(() => {
    store.fetchOrders()
  }, [store.filters, store.pagination.page])

  return store
}

export function useOrderById(id: string) {
  const { selectedOrder, isLoading, error, fetchOrderById } = useOrdersStore()

  useEffect(() => {
    if (id) {
      fetchOrderById(id)
    }
  }, [id, fetchOrderById])

  return {
    order: selectedOrder,
    isLoading,
    error,
  }
}