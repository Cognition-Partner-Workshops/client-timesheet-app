import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Layout from './Layout'
import React from 'react'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    logout: vi.fn(),
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/dashboard' }),
  }
})

const theme = createTheme()

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    <MemoryRouter>{children}</MemoryRouter>
  </ThemeProvider>
)

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render children', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should display user email', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test</div>
        </Layout>
      </TestWrapper>
    )

    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should display app title', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test</div>
        </Layout>
      </TestWrapper>
    )

    expect(screen.getAllByText('Time Tracker').length).toBeGreaterThan(0)
  })

  it('should display navigation items', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test</div>
        </Layout>
      </TestWrapper>
    )

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Clients').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Work Entries').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0)
  })

  it('should display logout button', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test</div>
        </Layout>
      </TestWrapper>
    )

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })
})
