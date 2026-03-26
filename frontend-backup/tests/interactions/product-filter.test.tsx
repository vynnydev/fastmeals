import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Simple filter component for testing
function ProductFilter({ onSearch, onClear }: { onSearch: (q: string) => void; onClear: () => void }) {
  return (
    <div>
      <input
        placeholder="Buscar produtos..."
        onChange={(e) => onSearch(e.target.value)}
        data-testid="search-input"
      />
      <button onClick={onClear}>Limpar</button>
    </div>
  )
}

describe('Product Filter Interaction', () => {
  it('calls onSearch when user types', async () => {
    const onSearch = vi.fn()
    const onClear = vi.fn()
    render(<ProductFilter onSearch={onSearch} onClear={onClear} />)

    const input = screen.getByTestId('search-input')
    await userEvent.type(input, 'hamburguer')

    expect(onSearch).toHaveBeenCalled()
    expect(input).toHaveValue('hamburguer')
  })

  it('calls onClear when button is clicked', async () => {
    const onSearch = vi.fn()
    const onClear = vi.fn()
    render(<ProductFilter onSearch={onSearch} onClear={onClear} />)

    await userEvent.click(screen.getByText('Limpar'))
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('filters text is reflected in input', async () => {
    const onSearch = vi.fn()
    const onClear = vi.fn()
    render(<ProductFilter onSearch={onSearch} onClear={onClear} />)

    const input = screen.getByTestId('search-input')
    await userEvent.clear(input)
    await userEvent.type(input, 'pizza')

    expect(input).toHaveValue('pizza')
  })
})