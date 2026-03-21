import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '@/components/shared/empty-state'

describe('EmptyState', () => {
  it('renders with default props', () => {
    render(<EmptyState />)
    expect(screen.getByText('Nada para exibir')).toBeInTheDocument()
    expect(screen.getByText('Nao ha dados disponiveis no momento.')).toBeInTheDocument()
  })

  it('renders with custom title and description', () => {
    render(<EmptyState title="Sem produtos" description="Adicione produtos" />)
    expect(screen.getByText('Sem produtos')).toBeInTheDocument()
    expect(screen.getByText('Adicione produtos')).toBeInTheDocument()
  })

  it('renders correct icon for each type', () => {
    const { rerender } = render(<EmptyState type="orders" />)
    expect(screen.getByText('Nenhum pedido encontrado')).toBeInTheDocument()

    rerender(<EmptyState type="products" />)
    expect(screen.getByText('Nenhum produto cadastrado')).toBeInTheDocument()

    rerender(<EmptyState type="delivery" />)
    expect(screen.getByText('Nenhum entregador cadastrado')).toBeInTheDocument()
  })

  it('renders action button when actionLabel and onAction provided', () => {
    const onAction = vi.fn()
    render(<EmptyState actionLabel="Criar" onAction={onAction} />)
    expect(screen.getByText('Criar')).toBeInTheDocument()
  })

  it('does not render action button when actionLabel is missing', () => {
    render(<EmptyState />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})