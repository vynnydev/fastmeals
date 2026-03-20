'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { reportsApi } from '@/lib/api'
import type { DashboardMetrics, ReportSummary, ReportFilters } from '@/types'

interface ReportsData {
  metrics: DashboardMetrics | null
  summary: ReportSummary | null
}

// Combined useReports hook
export function useReports() {
  const fetcher = async (): Promise<ReportsData> => {
    try {
      const [metrics, summary] = await Promise.all([
        reportsApi.getDashboardMetrics().catch(() => null),
        reportsApi.getSummary({}).catch(() => null)
      ])
      return { metrics, summary }
    } catch {
      return { metrics: null, summary: null }
    }
  }

  const { data, error, isLoading, mutate } = useSWR<ReportsData>(
    'reports-data',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    data,
    error: error ? (error instanceof Error ? error.message : 'Erro ao carregar relatorios') : null,
    isLoading,
    mutate
  }
}

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await reportsApi.getDashboardMetrics()
      setMetrics(data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar metricas'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics,
  }
}

export function useReportSummary(filters: ReportFilters) {
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await reportsApi.getSummary(filters)
      setSummary(data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar relatorio'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return {
    summary,
    isLoading,
    error,
    refetch: fetchSummary,
  }
}
