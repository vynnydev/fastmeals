import { useState, useEffect, useCallback } from 'react'
import { deliveryApi } from '@/lib/api'
import type { DeliveryPerson } from '@/types'

interface DeliveryData {
  deliveryPersons: DeliveryPerson[]
}

export function useDelivery() {
  const [data, setData] = useState<DeliveryData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const persons = await deliveryApi.getAll()
      setData({
        deliveryPersons: Array.isArray(persons) ? persons : (persons as any).data || [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    error,
    isLoading,
    mutate: fetchData,
  }
}