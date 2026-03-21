import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/shared/status-badge'

describe('StatusBadge', () => {
  it('renders pending status', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('Pendente')).toBeInTheDocument()
  })

  it('renders delivered status', () => {
    render(<StatusBadge status="delivered" />)
    expect(screen.getByText('Entregue')).toBeInTheDocument()
  })

  it('renders cancelled status', () => {
    render(<StatusBadge status="cancelled" />)
    expect(screen.getByText('Cancelado')).toBeInTheDocument()
  })

  it('renders with small size', () => {
    const { container } = render(<StatusBadge status="pending" size="sm" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders cancelled status with correct label', () => {
    render(<StatusBadge status="cancelled" />)
    expect(screen.getByText('Cancelado')).toBeInTheDocument()
  })
})