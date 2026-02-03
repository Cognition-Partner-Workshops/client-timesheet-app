import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import DashboardPage from './DashboardPage'
import apiClient from '../api/client'

vi.mock('../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getWorkEntries: vi.fn(),
  },
}))

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const theme = createTheme()

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

const renderDashboardPage = () => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })

    renderDashboardPage()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should display stats cards', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })

    renderDashboardPage()

    await waitFor(() => {
      expect(screen.getByText('Total Clients')).toBeInTheDocument()
    })

    expect(screen.getByText('Total Work Entries')).toBeInTheDocument()
    expect(screen.getByText('Total Hours')).toBeInTheDocument()
  })

  it('should display correct client count', async () => {
    const mockClients = [
      { id: 1, name: 'Client 1' },
      { id: 2, name: 'Client 2' },
    ]

    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: mockClients })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })

    renderDashboardPage()

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('should display correct total hours', async () => {
    const mockWorkEntries = [
      { id: 1, client_id: 1, hours: 5, date: '2024-01-01', client_name: 'Client 1' },
      { id: 2, client_id: 1, hours: 3, date: '2024-01-02', client_name: 'Client 1' },
    ]

    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: mockWorkEntries })

    renderDashboardPage()

    await waitFor(() => {
      expect(screen.getByText('8.00')).toBeInTheDocument()
    })
  })

  it('should navigate to clients page when clicking Total Clients card', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })

    renderDashboardPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('Total Clients')).toBeInTheDocument()
    })

    const clientsCard = screen.getByText('Total Clients').closest('[class*="MuiCard"]')
    await user.click(clientsCard!)

    expect(mockNavigate).toHaveBeenCalledWith('/clients')
  })

  it('should show empty state when no work entries', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })

    renderDashboardPage()

    await waitFor(() => {
      expect(screen.getByText('No work entries yet')).toBeInTheDocument()
    })
  })

  it('should display quick actions section', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })

    renderDashboardPage()

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view reports/i })).toBeInTheDocument()
  })

  it('should navigate when clicking Add Client button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })

    renderDashboardPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /add client/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/clients')
  })

  it('should display Recent Work Entries section', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })

    renderDashboardPage()

    await waitFor(() => {
      expect(screen.getByText('Recent Work Entries')).toBeInTheDocument()
    })
  })

  it('should display Add Entry button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })

    renderDashboardPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add entry/i })).toBeInTheDocument()
    })
  })
})
