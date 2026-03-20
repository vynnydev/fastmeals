'use client'

import { useEffect } from 'react'
import { useDeliveryStore } from '@/stores/delivery-store'

export function useDeliveryPersons() {
  const store = useDeliveryStore()

  useEffect(() => {
    store.fetchDeliveryPersons()
  }, [store.filters])

  return store
}

export function useDeliveryPersonById(id: string) {
  const { selectedPerson, isLoading, error, fetchPersonById } = useDeliveryStore()

  useEffect(() => {
    if (id) {
      fetchPersonById(id)
    }
  }, [id, fetchPersonById])

  return {
    person: selectedPerson,
    isLoading,
    error,
  }
}
