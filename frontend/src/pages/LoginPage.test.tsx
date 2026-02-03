import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
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

const theme = createTheme()

const renderLoginPage = () => {
  return render(
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </ThemeProvider>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form', () => {
    renderLoginPage()

    expect(screen.getByText('Time Tracker')).toBeInTheDocument()
    expect(screen.getByText('Enter your email to log in')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('should show info alert about no password', () => {
    renderLoginPage()

    expect(screen.getByText(/this app intentionally does not have a password field/i)).toBeInTheDocument()
  })

  it('should disable submit button when email is empty', () => {
    renderLoginPage()

    const submitButton = screen.getByRole('button', { name: /log in/i })
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when email is entered', async () => {
    renderLoginPage()
    const user = userEvent.setup()

    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', { name: /log in/i })
    expect(submitButton).toBeEnabled()
  })

  it('should call login and navigate on successful submit', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    renderLoginPage()
    const user = userEvent.setup()

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
    const errorResponse = {
      response: {
        data: {
          error: 'Invalid email format',
        },
      },
    }
    mockLogin.mockRejectedValueOnce(errorResponse)
    renderLoginPage()
    const user = userEvent.setup()

    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'invalid-email')

    const submitButton = screen.getByRole('button', { name: /log in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument()
    })
  })

  it('should show generic error message when no specific error provided', async () => {
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

  it('should update email value on input change', async () => {
    renderLoginPage()
    const user = userEvent.setup()

    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
    await user.type(emailInput, 'test@example.com')

    expect(emailInput.value).toBe('test@example.com')
  })

  it('should prevent default form submission', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    renderLoginPage()

    const form = document.querySelector('form')
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
    const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault')

    fireEvent(form!, submitEvent)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })
})
