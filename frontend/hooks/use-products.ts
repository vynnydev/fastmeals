'use client'

import { useEffect } from 'react'
import { useProductsStore } from '@/stores/products-store'

export function useProducts() {
  const store = useProductsStore()

  useEffect(() => {
    store.fetchProducts()
  }, [store.filters])

  return store
}

export function useProductById(id: string) {
  const { selectedProduct, isLoading, error, fetchProductById } = useProductsStore()

  useEffect(() => {
    if (id) {
      fetchProductById(id)
    }
  }, [id, fetchProductById])

  return {
    product: selectedProduct,
    isLoading,
    error,
  }
}
