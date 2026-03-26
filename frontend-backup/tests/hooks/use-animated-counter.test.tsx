import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnimatedCounter } from '@/hooks/use-animated-counter'

describe('useAnimatedCounter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts at 0', () => {
    const { result } = renderHook(() => useAnimatedCounter(100, { duration: 1000 }))
    expect(result.current).toBe(0)
  })

  it('returns 0 when target is 0', () => {
    const { result } = renderHook(() => useAnimatedCounter(0))
    expect(result.current).toBe(0)
  })

  it('accepts custom duration', () => {
    const { result } = renderHook(() => useAnimatedCounter(50, { duration: 500 }))
    expect(result.current).toBeGreaterThanOrEqual(0)
  })
})