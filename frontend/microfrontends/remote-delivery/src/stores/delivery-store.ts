import { create } from 'zustand'
import type { DeliveryPerson, DeliveryPersonStatus, DeliveryPersonCreateRequest } from '@/types'
import { deliveryApi } from '@/lib/api'

interface DeliveryState {
  deliveryPersons: DeliveryPerson[]
  selectedPerson: DeliveryPerson | null
  isLoading: boolean
  error: string | null
  filters: {
    status: DeliveryPersonStatus | 'all'
    search: string
    activeOnly: boolean
  }

  fetchDeliveryPersons: () => Promise<void>
  fetchPersonById: (id: string) => Promise<void>
  createPerson: (data: DeliveryPersonCreateRequest) => Promise<DeliveryPerson>
  updatePerson: (id: string, data: Partial<DeliveryPersonCreateRequest>) => Promise<void>
  deletePerson: (id: string) => Promise<void>
  setFilters: (filters: Partial<DeliveryState['filters']>) => void
  setSelectedPerson: (person: DeliveryPerson | null) => void
  clearError: () => void
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  deliveryPersons: [],
  selectedPerson: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    search: '',
    activeOnly: false,
  },

  fetchDeliveryPersons: async () => {
    const { filters } = get()
    set({ isLoading: true, error: null })

    try {
      const params: { status?: string; active?: boolean } = {}
      if (filters.status !== 'all') params.status = filters.status
      if (filters.activeOnly) params.active = true

      const persons = await deliveryApi.getAll(params)

      let filteredPersons = persons
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredPersons = persons.filter(
          (p) => p.name.toLowerCase().includes(searchLower) || p.phone.includes(filters.search)
        )
      }

      set({ deliveryPersons: filteredPersons, isLoading: false })
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Erro ao carregar entregadores', isLoading: false })
    }
  },

  fetchPersonById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const person = await deliveryApi.getById(id)
      set({ selectedPerson: person, isLoading: false })
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Erro ao carregar entregador', isLoading: false })
    }
  },

  createPerson: async (data: DeliveryPersonCreateRequest) => {
    set({ isLoading: true, error: null })
    try {
      const newPerson = await deliveryApi.create(data)
      set((state) => ({
        deliveryPersons: [...state.deliveryPersons, newPerson],
        isLoading: false,
      }))
      return newPerson
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Erro ao criar entregador', isLoading: false })
      throw error
    }
  },

  updatePerson: async (id: string, data: Partial<DeliveryPersonCreateRequest>) => {
    set({ isLoading: true, error: null })
    try {
      const updatedPerson = await deliveryApi.update(id, data)
      set((state) => ({
        deliveryPersons: state.deliveryPersons.map((p) => (p.id === id ? updatedPerson : p)),
        selectedPerson: state.selectedPerson?.id === id ? updatedPerson : state.selectedPerson,
        isLoading: false,
      }))
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Erro ao atualizar entregador', isLoading: false })
      throw error
    }
  },

  deletePerson: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await deliveryApi.delete(id)
      set((state) => ({
        deliveryPersons: state.deliveryPersons.filter((p) => p.id !== id),
        selectedPerson: state.selectedPerson?.id === id ? null : state.selectedPerson,
        isLoading: false,
      }))
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Erro ao excluir entregador', isLoading: false })
      throw error
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }))
  },

  setSelectedPerson: (person) => set({ selectedPerson: person }),

  clearError: () => set({ error: null }),
}))