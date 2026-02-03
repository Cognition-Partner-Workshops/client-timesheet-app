import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import LoginPage from './LoginPage'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isLoading: false,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Time Tracker')).toBeInTheDocument()
    expect(screen.getByText('Enter your email to log in')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('should show info alert about no password', () => {
    render(<LoginPage />)
    
    expect(screen.getByText(/this app intentionally does not have a password field/i)).toBeInTheDocument()
  })

  it('should disable submit button when email is empty', () => {
    render(<LoginPage />)
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when email is entered', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    expect(submitButton).toBeEnabled()
  })

  it('should call login and navigate on successful submit', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com')
    })
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should show error message on login failure', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { error: 'Invalid email' } },
    })
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'invalid@example.com')
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })
  })

  it('should show default error message when no specific error', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network error'))
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument()
    })
  })

  it('should show loading state during login', async () => {
    let resolveLogin: () => void
    mockLogin.mockImplementationOnce(() => new Promise<void>((resolve) => {
      resolveLogin = resolve
    }))
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
    
    resolveLogin!()
  })

  it('should disable input during loading', async () => {
    let resolveLogin: () => void
    mockLogin.mockImplementationOnce(() => new Promise<void>((resolve) => {
      resolveLogin = resolve
    }))
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(emailInput).toBeDisabled()
    })
    
    resolveLogin!()
  })

  it('should handle form submission via enter key', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')
    
    fireEvent.submit(emailInput.closest('form')!)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com')
    })
  })
})
