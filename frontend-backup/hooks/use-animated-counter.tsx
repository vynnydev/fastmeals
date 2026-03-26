'use client'

import { useState, useEffect, useRef } from 'react'

interface UseAnimatedCounterOptions {
  duration?: number
  delay?: number
  decimals?: number
}

export function useAnimatedCounter(
  target: number,
  options: UseAnimatedCounterOptions = {}
) {
  const { duration = 1500, delay = 0, decimals = 0 } = options
  const [count, setCount] = useState(0)
  const startTime = useRef<number | null>(null)
  const animationFrame = useRef<number | null>(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (target === 0) {
      setCount(0)
      return
    }

    const startAnimation = () => {
      hasStarted.current = true
      startTime.current = null

      const animate = (timestamp: number) => {
        if (!startTime.current) startTime.current = timestamp
        const elapsed = timestamp - startTime.current
        const progress = Math.min(elapsed / duration, 1)

        // Easing: ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        const currentValue = eased * target

        setCount(Number(currentValue.toFixed(decimals)))

        if (progress < 1) {
          animationFrame.current = requestAnimationFrame(animate)
        }
      }

      animationFrame.current = requestAnimationFrame(animate)
    }

    const timer = setTimeout(startAnimation, delay)

    return () => {
      clearTimeout(timer)
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [target, duration, delay, decimals])

  return count
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1500,
  delay = 0,
  className = '',
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  delay?: number
  className?: string
}) {
  const count = useAnimatedCounter(value, { duration, delay, decimals })

  const formatted = decimals > 0
    ? count.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : count.toLocaleString('pt-BR')

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}

export function AnimatedCurrency({
  value,
  duration = 1500,
  delay = 0,
  className = '',
}: {
  value: number
  duration?: number
  delay?: number
  className?: string
}) {
  const count = useAnimatedCounter(value, { duration, delay, decimals: 2 })

  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(count)

  return <span className={className}>{formatted}</span>
}