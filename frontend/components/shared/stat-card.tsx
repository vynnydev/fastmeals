'use client'

import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'info'
  className?: string
  onClick?: () => void
}

const variantStyles = {
  default: 'bg-card border-border',
  gold: 'gold-gradient border-0 text-primary-foreground',
  success: 'bg-status-delivered/10 border-status-delivered/20',
  warning: 'bg-status-pending/10 border-status-pending/20',
  info: 'bg-chart-3/10 border-chart-3/20',
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon: Icon,
  variant = 'default',
  className,
  onClick,
}: StatCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0
  const isGold = variant === 'gold'

  return (
    <Card
      className={cn(
        'p-6 transition-all duration-200 hover:shadow-lg',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <span
          className={cn(
            'text-sm font-medium',
            isGold ? 'text-primary-foreground/80' : 'text-muted-foreground'
          )}
        >
          {title}
        </span>
        {Icon && (
          <div
            className={cn(
              'rounded-lg p-2',
              isGold ? 'bg-primary-foreground/20' : 'bg-muted'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4',
                isGold ? 'text-primary-foreground' : 'text-muted-foreground'
              )}
            />
          </div>
        )}
        {onClick && !Icon && (
          <ArrowUpRight
            className={cn(
              'h-5 w-5',
              isGold ? 'text-primary-foreground/60' : 'text-muted-foreground'
            )}
          />
        )}
      </div>

      <div className="space-y-1">
        <h3
          className={cn(
            'text-3xl font-bold tracking-tight',
            isGold ? 'text-primary-foreground' : 'text-foreground'
          )}
        >
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </h3>

        {(subtitle || change !== undefined) && (
          <div className="flex items-center gap-2">
            {change !== undefined && (
              <span
                className={cn(
                  'flex items-center text-sm font-medium',
                  isPositive && 'text-status-delivered',
                  isNegative && 'text-destructive',
                  !isPositive && !isNegative && 'text-muted-foreground'
                )}
              >
                {isPositive && <ArrowUpRight className="h-3 w-3" />}
                {isNegative && <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(change)}%
              </span>
            )}
            {(subtitle || changeLabel) && (
              <span
                className={cn(
                  'text-sm',
                  isGold ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}
              >
                {subtitle || changeLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
