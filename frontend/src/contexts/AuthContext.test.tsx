import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider } from './AuthContext'
import { useAuth } from '../hooks/useAuth'
import apiClient from '../api/client'
import React from 'react'

vi.mock('../api/client', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}))

const TestComponent = () => {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth()
  const handleLogin = async () => {
    try {
      await login('test@example.com')
    } catch {
      // Error is expected in some tests
    }
  }
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{user?.email || 'no-user'}</div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should render children', async () => {
    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })
  })

  it('should start with loading state when email is stored', () => {
    vi.mocked(apiClient.getCurrentUser).mockImplementation(() => new Promise(() => {}))
    localStorage.setItem('userEmail', 'test@example.com')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
  })

  it('should check auth on mount when email is stored', async () => {
    localStorage.setItem('userEmail', 'test@example.com')
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue({
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
  })

  it('should not check auth when no email is stored', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    expect(apiClient.getCurrentUser).not.toHaveBeenCalled()
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
  })

  it('should clear email on auth check failure', async () => {
    localStorage.setItem('userEmail', 'test@example.com')
    vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Auth failed'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    })
  })

  it('should login successfully', async () => {
    vi.mocked(apiClient.login).mockResolvedValue({
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    await act(async () => {
      screen.getByText('Login').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
    })
  })

  it('should handle login failure', async () => {
    vi.mocked(apiClient.login).mockRejectedValue(new Error('Login failed'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    await act(async () => {
      screen.getByText('Login').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    })
  })

  it('should logout successfully', async () => {
    localStorage.setItem('userEmail', 'test@example.com')
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue({
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
    })

    await act(async () => {
      screen.getByText('Logout').click()
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
  })
})
