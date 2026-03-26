'use client'

import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
  isNetworkError?: boolean
}

export function ErrorState({
  title,
  message,
  onRetry,
  className,
  isNetworkError = false,
}: ErrorStateProps) {
  const Icon = isNetworkError ? WifiOff : AlertTriangle

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="rounded-full bg-destructive/10 p-6 mb-6">
        <Icon className="h-12 w-12 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title || (isNetworkError ? 'Erro de conexao' : 'Algo deu errado')}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {message ||
          (isNetworkError
            ? 'Verifique sua conexao com a internet e tente novamente.'
            : 'Ocorreu um erro inesperado. Por favor, tente novamente.')}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
