import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { AuthContext, type AuthContextType } from '../contexts/AuthContextValue'
import LoginPage from './LoginPage'
import React, { type ReactNode } from 'react'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const theme = createTheme()

interface TestWrapperProps {
  children: ReactNode
  authValue: AuthContextType
}

const TestWrapper = ({ children, authValue }: TestWrapperProps) => (
  <ThemeProvider theme={theme}>
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>{children}</BrowserRouter>
    </AuthContext.Provider>
  </ThemeProvider>
)

describe('LoginPage', () => {
  const mockLogin = vi.fn()
  const defaultAuthValue: AuthContextType = {
    user: null,
    login: mockLogin,
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form', () => {
    render(
      <TestWrapper authValue={defaultAuthValue}>
        <LoginPage />
      </TestWrapper>
    )

    expect(screen.getByText('Time Tracker')).toBeInTheDocument()
    expect(screen.getByText('Enter your email to log in')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('should show info alert about no password', () => {
    render(
      <TestWrapper authValue={defaultAuthValue}>
        <LoginPage />
      </TestWrapper>
    )

    expect(screen.getByText(/this app intentionally does not have a password field/i)).toBeInTheDocument()
  })

  it('should disable submit button when email is empty', () => {
    render(
      <TestWrapper authValue={defaultAuthValue}>
        <LoginPage />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /log in/i })
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when email is entered', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper authValue={defaultAuthValue}>
        <LoginPage />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', { name: /log in/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('should call login and navigate on successful submit', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(undefined)

    render(
      <TestWrapper authValue={defaultAuthValue}>
        <LoginPage />
      </TestWrapper>
    )

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
    const user = userEvent.setup()
    mockLogin.mockRejectedValue({
      response: { data: { error: 'Invalid email' } },
    })

    render(
      <TestWrapper authValue={defaultAuthValue}>
        <LoginPage />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'invalid@example.com')

    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })
  })

  it('should show generic error message when no specific error', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValue(new Error('Network error'))

    render(
      <TestWrapper authValue={defaultAuthValue}>
        <LoginPage />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument()
    })
  })

  it('should show loading state during login', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise(() => {}))

    render(
      <TestWrapper authValue={defaultAuthValue}>
        <LoginPage />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  it('should disable input during loading', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise(() => {}))

    render(
      <TestWrapper authValue={defaultAuthValue}>
        <LoginPage />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(emailInput).toBeDisabled()
    })
  })

  it('should clear error when submitting again', async () => {
    const user = userEvent.setup()
    mockLogin
      .mockRejectedValueOnce({ response: { data: { error: 'First error' } } })
      .mockResolvedValueOnce(undefined)

    render(
      <TestWrapper authValue={defaultAuthValue}>
        <LoginPage />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument()
    })

    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument()
    })
  })

  it('should handle form submission via enter key', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(undefined)

    render(
      <TestWrapper authValue={defaultAuthValue}>
        <LoginPage />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com{enter}')

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com')
    })
  })
})
