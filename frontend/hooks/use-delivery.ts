'use client'

import { useEffect, useCallback } from 'react'
import { useDeliveryStore } from '@/stores/delivery-store'
import useSWR from 'swr'
import { deliveryApi } from '@/lib/api'
import type { Delivery, DeliveryPerson } from '@/types'

interface DeliveryData {
  deliveryPersons: DeliveryPerson[]
  deliveries: Delivery[]
}

export function useDeliveryPersons() {
  const store = useDeliveryStore()

  useEffect(() => {
    store.fetchDeliveryPersons()
  }, [store.filters])

  return store
}

// Alias for backward compatibility
export function useDelivery() {
  const fetcher = async (): Promise<DeliveryData> => {
    const [persons, deliveries] = await Promise.all([
      deliveryApi.getAll(),
      deliveryApi.getDeliveries()
    ])
    return {
      deliveryPersons: persons,
      deliveries: deliveries
    }
  }

  const { data, error, isLoading, mutate } = useSWR<DeliveryData>(
    'delivery-data',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    data,
    error: error ? (error instanceof Error ? error.message : 'Erro ao carregar dados') : null,
    isLoading,
    mutate
  }
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
