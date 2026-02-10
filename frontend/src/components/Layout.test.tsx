import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from './Layout'
import { AuthProvider } from '../contexts/AuthContext'

vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      user: { email: 'test@example.com' },
      logout: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
    }),
  }
})

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Layout', () => {
  it('renders the app title', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>)
    const titles = screen.getAllByText('Time Tracker')
    expect(titles.length).toBeGreaterThan(0)
  })

  it('renders navigation menu items', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>)
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Clients').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Work Entries').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0)
  })

  it('renders children content', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('displays user email', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>)
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('renders logout button', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>)
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('renders user avatar with first letter of email', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>)
    expect(screen.getByText('T')).toBeInTheDocument()
  })
})
