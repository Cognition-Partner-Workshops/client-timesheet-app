import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../hooks/useAuth', () => ({
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

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login form', () => {
    renderLoginPage()
    
    expect(screen.getByText('Time Tracker')).toBeInTheDocument()
    expect(screen.getByText('Enter your email to log in')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('displays info alert about no password', () => {
    renderLoginPage()
    
    expect(screen.getByText(/this app intentionally does not have a password field/i)).toBeInTheDocument()
  })

  it('disables submit button when email is empty', () => {
    renderLoginPage()
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when email is entered', async () => {
    renderLoginPage()
    const user = userEvent.setup()
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    expect(submitButton).toBeEnabled()
  })

  it('calls login and navigates on successful submit', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    renderLoginPage()
    const user = userEvent.setup()
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays error message on login failure', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { error: 'Invalid email' } }
    })
    renderLoginPage()
    const user = userEvent.setup()
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'invalid@example.com')
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })
  })

  it('displays generic error message when no specific error provided', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network error'))
    renderLoginPage()
    const user = userEvent.setup()
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument()
    })
  })

  it('updates email state when typing', async () => {
    renderLoginPage()
    const user = userEvent.setup()
    
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
    await user.type(emailInput, 'user@test.com')
    
    expect(emailInput.value).toBe('user@test.com')
  })
})
