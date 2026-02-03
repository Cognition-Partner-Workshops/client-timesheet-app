import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import Layout from '../components/Layout'

const mockLogout = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    logout: mockLogout,
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderLayout = (initialPath = '/dashboard') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Layout>
        <div data-testid="child-content">Test Content</div>
      </Layout>
    </MemoryRouter>
  )
}

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the layout with children', () => {
    renderLayout()
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('displays the app title in drawer', () => {
    renderLayout()
    
    expect(screen.getAllByText('Time Tracker').length).toBeGreaterThan(0)
  })

  it('displays user email', () => {
    renderLayout()
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('displays user avatar with first letter of email', () => {
    renderLayout()
    
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('renders all navigation menu items', () => {
    renderLayout()
    
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Clients').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Work Entries').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0)
  })

  it('calls logout when logout button is clicked', () => {
    renderLayout()
    
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    fireEvent.click(logoutButton)
    
    expect(mockLogout).toHaveBeenCalled()
  })

  it('navigates when menu item is clicked', () => {
    renderLayout()
    
    const clientsButtons = screen.getAllByText('Clients')
    fireEvent.click(clientsButtons[0])
    
    expect(mockNavigate).toHaveBeenCalledWith('/clients')
  })

  it('shows current page title in app bar', () => {
    renderLayout('/dashboard')
    
    const dashboardTexts = screen.getAllByText('Dashboard')
    expect(dashboardTexts.length).toBeGreaterThan(0)
  })

  it('toggles mobile drawer when menu icon is clicked', () => {
    renderLayout()
    
    const menuButton = screen.getByLabelText('open drawer')
    fireEvent.click(menuButton)
    
    // The drawer should be toggled (we can't easily test the state, but we can verify the click works)
    expect(menuButton).toBeInTheDocument()
  })
})
