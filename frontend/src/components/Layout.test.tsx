import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme()

const mockUser = { email: 'test@example.com' }
const mockLogout = vi.fn()
const mockUseAuth = vi.fn(() => ({
  user: mockUser,
  logout: mockLogout,
  isAuthenticated: true,
  isLoading: false,
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

import Layout from './Layout'

const renderWithProviders = (children: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Layout>{children}</Layout>
      </ThemeProvider>
    </BrowserRouter>
  )
}

describe('Layout', () => {
  it('renders children content', () => {
    renderWithProviders(<div data-testid="child-content">Test Content</div>)
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('displays the app title "Time Tracker"', () => {
    renderWithProviders(<div>Content</div>)
    expect(screen.getAllByText('Time Tracker').length).toBeGreaterThan(0)
  })

  it('displays navigation menu items', () => {
    renderWithProviders(<div>Content</div>)
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Clients').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Work Entries').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0)
  })

  it('displays user email', () => {
    renderWithProviders(<div>Content</div>)
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('displays logout button', () => {
    renderWithProviders(<div>Content</div>)
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('displays user avatar with first letter of email', () => {
    renderWithProviders(<div>Content</div>)
    expect(screen.getByText('T')).toBeInTheDocument()
  })
})
