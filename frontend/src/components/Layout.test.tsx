import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Layout from './Layout'

const mockLogout = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', createdAt: '2024-01-01' },
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

const theme = createTheme()

const renderLayout = (initialRoute = '/dashboard') => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    </ThemeProvider>
  )
}

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render children content', () => {
    renderLayout()

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should display user email', () => {
    renderLayout()

    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should display user avatar with first letter', () => {
    renderLayout()

    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('should render navigation menu items', () => {
    renderLayout()

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Clients').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Work Entries').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0)
  })

  it('should render logout button', () => {
    renderLayout()

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('should call logout when clicking logout button', async () => {
    renderLayout()
    const user = userEvent.setup()

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
  })

  it('should navigate when clicking menu items', async () => {
    renderLayout()
    const user = userEvent.setup()

    const clientsLinks = screen.getAllByText('Clients')
    await user.click(clientsLinks[0])

    expect(mockNavigate).toHaveBeenCalledWith('/clients')
  })

  it('should display Time Tracker title in drawer', () => {
    renderLayout()

    expect(screen.getAllByText('Time Tracker').length).toBeGreaterThan(0)
  })

  it('should render navigation for current route', () => {
    renderLayout('/dashboard')

    const dashboardItems = screen.getAllByText('Dashboard')
    expect(dashboardItems.length).toBeGreaterThan(0)
  })

  it('should render mobile menu toggle button', () => {
    renderLayout()

    const menuButton = screen.getByRole('button', { name: /open drawer/i })
    expect(menuButton).toBeInTheDocument()
  })

  it('should toggle mobile drawer when clicking menu button', async () => {
    renderLayout()
    const user = userEvent.setup()

    const menuButton = screen.getByRole('button', { name: /open drawer/i })
    await user.click(menuButton)

    await waitFor(() => {
      const drawers = document.querySelectorAll('[class*="MuiDrawer"]')
      expect(drawers.length).toBeGreaterThan(0)
    })
  })

  it('should display correct page title based on route', () => {
    renderLayout('/clients')

    const appBarTitle = screen.getAllByText('Clients')
    expect(appBarTitle.length).toBeGreaterThan(0)
  })

  it('should navigate to dashboard when clicking Dashboard menu item', async () => {
    renderLayout('/clients')
    const user = userEvent.setup()

    const dashboardLinks = screen.getAllByText('Dashboard')
    await user.click(dashboardLinks[0])

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('should navigate to work-entries when clicking Work Entries menu item', async () => {
    renderLayout()
    const user = userEvent.setup()

    const workEntriesLinks = screen.getAllByText('Work Entries')
    await user.click(workEntriesLinks[0])

    expect(mockNavigate).toHaveBeenCalledWith('/work-entries')
  })

  it('should navigate to reports when clicking Reports menu item', async () => {
    renderLayout()
    const user = userEvent.setup()

    const reportsLinks = screen.getAllByText('Reports')
    await user.click(reportsLinks[0])

    expect(mockNavigate).toHaveBeenCalledWith('/reports')
  })
})
