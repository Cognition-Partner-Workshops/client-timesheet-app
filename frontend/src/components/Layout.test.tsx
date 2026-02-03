import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import Layout from './Layout'

const mockLogout = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => ({ pathname: '/dashboard' }),
  }
})

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', createdAt: '2024-01-01' },
    logout: mockLogout,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
  }),
}))

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render children', () => {
    render(
      <Layout>
        <div data-testid="child-content">Test Content</div>
      </Layout>
    )
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should display app title in drawer', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    expect(screen.getAllByText('Time Tracker').length).toBeGreaterThan(0)
  })

  it('should display user email', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should display logout button', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('should call logout when logout button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)
    
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
    })
  })
})
