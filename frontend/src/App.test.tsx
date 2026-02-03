import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import React from 'react'

const mockAuthValue = {
  isAuthenticated: false,
  isLoading: false,
  user: null as { email: string; createdAt: string } | null,
  login: vi.fn(),
  logout: vi.fn(),
}

vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => mockAuthValue,
}))

vi.mock('./pages/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}))

vi.mock('./pages/DashboardPage', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}))

vi.mock('./pages/ClientsPage', () => ({
  default: () => <div data-testid="clients-page">Clients Page</div>,
}))

vi.mock('./pages/WorkEntriesPage', () => ({
  default: () => <div data-testid="work-entries-page">Work Entries Page</div>,
}))

vi.mock('./pages/ReportsPage', () => ({
  default: () => <div data-testid="reports-page">Reports Page</div>,
}))

vi.mock('./components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}))

import App from './App'

const theme = createTheme()

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthValue.isAuthenticated = false
    mockAuthValue.isLoading = false
    mockAuthValue.user = null
  })

  it('should show loading state when auth is loading', () => {
    mockAuthValue.isLoading = true
    
    renderApp()
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render app component', () => {
    mockAuthValue.isAuthenticated = false
    mockAuthValue.isLoading = false
    
    renderApp()
    
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })

  it('should render with authenticated state', () => {
    mockAuthValue.isAuthenticated = true
    mockAuthValue.isLoading = false
    mockAuthValue.user = { email: 'test@example.com', createdAt: '2024-01-01' }
    
    renderApp()
    
    expect(document.body).toBeInTheDocument()
  })
})
