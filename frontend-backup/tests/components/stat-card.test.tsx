import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StatCard } from '@/components/shared/stat-card'
import { DollarSign } from 'lucide-react'

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Receita" value="R$ 500,00" />)
    expect(screen.getByText('Receita')).toBeInTheDocument()
    expect(screen.getByText('R$ 500,00')).toBeInTheDocument()
  })

  it('renders loading skeleton when loading is true', () => {
    const { container } = render(<StatCard title="Test" value="100" loading />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders positive change with up arrow', () => {
    render(<StatCard title="Orders" value="50" change={12.5} />)
    expect(screen.getByText('12.5%')).toBeInTheDocument()
  })

  it('renders negative change', () => {
    render(<StatCard title="Time" value="30 min" change={-5} />)
    expect(screen.getByText('5%')).toBeInTheDocument()
  })

  it('handles click event', () => {
    const onClick = vi.fn()
    render(<StatCard title="Click me" value="0" onClick={onClick} />)
    fireEvent.click(screen.getByText('Click me').closest('[class*="card"]')!)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders with gold variant', () => {
    const { container } = render(<StatCard title="Gold" value="100" variant="gold" />)
    expect(container.firstChild).toHaveClass('gold-gradient')
  })
})