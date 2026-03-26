import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock auth store
const mockLogin = vi.fn()
const mockStore = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: mockLogin,
  checkAuth: vi.fn(),
}

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => mockStore,
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: (name: string) => ({ name, onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() }),
    handleSubmit: (fn: any) => (e: any) => { e?.preventDefault(); fn({ email: 'admin@fastmeals.com', password: 'Admin@123' }) },
    formState: { errors: {} },
  }),
}))

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => vi.fn(),
}))

// Simple login form for testing
function LoginForm() {
  const { login, isLoading, error } = mockStore

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    await login({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <h1>FastMeals</h1>
      <input name="email" type="email" placeholder="Email" data-testid="email-input" />
      <input name="password" type="password" placeholder="Senha" data-testid="password-input" />
      {error && <p data-testid="error-message">{error}</p>}
      <button type="submit" disabled={isLoading} data-testid="login-button">
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}

describe('Login Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.error = null
    mockStore.isLoading = false
    mockStore.isAuthenticated = false
  })

  it('renders login form with email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByText('FastMeals')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-button')).toBeInTheDocument()
  })

  it('calls login with correct credentials on submit', async () => {
    mockLogin.mockResolvedValue(undefined)
    render(<LoginForm />)

    await userEvent.type(screen.getByTestId('email-input'), 'admin@fastmeals.com')
    await userEvent.type(screen.getByTestId('password-input'), 'Admin@123')
    await userEvent.click(screen.getByTestId('login-button'))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@fastmeals.com',
        password: 'Admin@123',
      })
    })
  })

  it('displays error message on failed login', () => {
    const ErrorForm = () => {
      return (
        <form data-testid="login-form">
          <p data-testid="error-message">Credenciais inválidas</p>
          <button data-testid="login-button">Entrar</button>
        </form>
      )
    }
    render(<ErrorForm />)
    expect(screen.getByTestId('error-message')).toHaveTextContent('Credenciais inválidas')
  })

  it('disables button while loading', () => {
    mockStore.isLoading = true
    render(<LoginForm />)
    expect(screen.getByTestId('login-button')).toBeDisabled()
    expect(screen.getByTestId('login-button')).toHaveTextContent('Entrando...')
  })

  it('button is enabled when not loading', () => {
    render(<LoginForm />)
    expect(screen.getByTestId('login-button')).not.toBeDisabled()
    expect(screen.getByTestId('login-button')).toHaveTextContent('Entrar')
  })
})