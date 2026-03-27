import { create } from 'zustand'
import type { Product, ProductCategory, ProductCreateRequest, ViewMode } from '@/types'
import { productsApi } from '@/lib/api'

interface ProductsState {
  products: Product[]
  selectedProduct: Product | null
  isLoading: boolean
  error: string | null
  viewMode: ViewMode
  filters: {
    category: ProductCategory | 'all'
    search: string
    showUnavailable: boolean
  }

  fetchProducts: () => Promise<void>
  fetchProductById: (id: string) => Promise<void>
  createProduct: (data: ProductCreateRequest) => Promise<Product>
  updateProduct: (id: string, data: Partial<ProductCreateRequest>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  toggleAvailability: (id: string) => Promise<void>
  setViewMode: (mode: ViewMode) => void
  setFilters: (filters: Partial<ProductsState['filters']>) => void
  setSelectedProduct: (product: Product | null) => void
  clearError: () => void
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  viewMode: 'grid',
  filters: {
    category: 'all',
    search: '',
    showUnavailable: true,
  },

  fetchProducts: async () => {
    const { filters } = get()
    set({ isLoading: true, error: null })

    try {
      const params: { category?: string; available?: boolean } = {}

      if (filters.category !== 'all') {
        params.category = filters.category
      }

      if (!filters.showUnavailable) {
        params.available = true
      }

      const products = await productsApi.getAll(params)

      let filteredProducts = products
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredProducts = products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
        )
      }

      set({ products: filteredProducts, isLoading: false })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar produtos'
      set({ error: errorMessage, isLoading: false })
    }
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const product = await productsApi.getById(id)
      set({ selectedProduct: product, isLoading: false })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar produto'
      set({ error: errorMessage, isLoading: false })
    }
  },

  createProduct: async (data: ProductCreateRequest) => {
    set({ isLoading: true, error: null })
    try {
      const newProduct = await productsApi.create(data)
      set((state) => ({
        products: [...state.products, newProduct],
        isLoading: false,
      }))
      return newProduct
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar produto'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  updateProduct: async (id: string, data: Partial<ProductCreateRequest>) => {
    set({ isLoading: true, error: null })
    try {
      const updatedProduct = await productsApi.update(id, data)
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
        selectedProduct: state.selectedProduct?.id === id ? updatedProduct : state.selectedProduct,
        isLoading: false,
      }))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar produto'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await productsApi.delete(id)
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
        isLoading: false,
      }))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir produto'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  toggleAvailability: async (id: string) => {
    try {
      const updatedProduct = await productsApi.toggleAvailability(id)
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
      }))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar disponibilidade'
      set({ error: errorMessage })
      throw error
    }
  },

  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

  setFilters: (newFilters: Partial<ProductsState['filters']>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
  },

  setSelectedProduct: (product: Product | null) => set({ selectedProduct: product }),

  clearError: () => set({ error: null }),
}))