import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'
import React from 'react'

vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    isLoading: false,
    isAuthenticated: false,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))

vi.mock('./pages/LoginPage', () => ({
  default: () => <div>Login Page</div>,
}))

vi.mock('./pages/DashboardPage', () => ({
  default: () => <div>Dashboard Page</div>,
}))

vi.mock('./pages/ClientsPage', () => ({
  default: () => <div>Clients Page</div>,
}))

vi.mock('./pages/WorkEntriesPage', () => ({
  default: () => <div>Work Entries Page</div>,
}))

vi.mock('./pages/ReportsPage', () => ({
  default: () => <div>Reports Page</div>,
}))

vi.mock('./components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}))

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />)
    expect(document.body).toBeInTheDocument()
  })

  it('should show login page when not authenticated', () => {
    render(<App />)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
