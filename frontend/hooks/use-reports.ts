'use client'

import { useState, useEffect, useCallback } from 'react'
import { reportsApi } from '@/lib/api'

interface ReportsData {
  metrics: any
  summary: any
}

export function useReports() {
  const [data, setData] = useState<ReportsData>({ metrics: null, summary: null })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const metrics = await reportsApi.getDashboardMetrics().catch(() => null)
      setData({ metrics, summary: null })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar métricas'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    mutate()
  }, [mutate])

  return { data, isLoading, error, mutate }
}