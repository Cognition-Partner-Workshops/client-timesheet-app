import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import DashboardPage from './DashboardPage'
import apiClient from '../api/client'
import React, { type ReactNode } from 'react'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getWorkEntries: vi.fn(),
  },
}))

const theme = createTheme()

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

interface TestWrapperProps {
  children: ReactNode
}

const TestWrapper = ({ children }: TestWrapperProps) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>{children}</BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should display stats cards', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Total Clients')).toBeInTheDocument()
      expect(screen.getByText('Total Work Entries')).toBeInTheDocument()
      expect(screen.getByText('Total Hours')).toBeInTheDocument()
    })
  })

  it('should display correct client count', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Client 1' },
        { id: 2, name: 'Client 2' },
      ],
    })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('should display correct work entries count', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, hours: 4, client_name: 'Client 1', date: '2024-01-01' },
        { id: 2, hours: 6, client_name: 'Client 2', date: '2024-01-02' },
        { id: 3, hours: 2, client_name: 'Client 1', date: '2024-01-03' },
      ],
    })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  it('should display correct total hours', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, hours: 4, client_name: 'Client 1', date: '2024-01-01' },
        { id: 2, hours: 6, client_name: 'Client 2', date: '2024-01-02' },
      ],
    })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('10.00')).toBeInTheDocument()
    })
  })

  it('should navigate to clients page when clicking Total Clients card', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Total Clients')).toBeInTheDocument()
    })

    const clientsCard = screen.getByText('Total Clients').closest('[class*="MuiCard"]')
    fireEvent.click(clientsCard!)

    expect(mockNavigate).toHaveBeenCalledWith('/clients')
  })

  it('should navigate to work entries page when clicking Total Work Entries card', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Total Work Entries')).toBeInTheDocument()
    })

    const entriesCard = screen.getByText('Total Work Entries').closest('[class*="MuiCard"]')
    fireEvent.click(entriesCard!)

    expect(mockNavigate).toHaveBeenCalledWith('/work-entries')
  })

  it('should navigate to reports page when clicking Total Hours card', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Total Hours')).toBeInTheDocument()
    })

    const hoursCard = screen.getByText('Total Hours').closest('[class*="MuiCard"]')
    fireEvent.click(hoursCard!)

    expect(mockNavigate).toHaveBeenCalledWith('/reports')
  })

  it('should display recent work entries section', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Recent Work Entries')).toBeInTheDocument()
    })
  })

  it('should display message when no work entries', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('No work entries yet')).toBeInTheDocument()
    })
  })

  it('should display recent work entries', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, hours: 4, client_name: 'Test Client', date: '2024-01-01', description: 'Test work' },
      ],
    })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument()
      expect(screen.getByText('Test work')).toBeInTheDocument()
    })
  })

  it('should display quick actions section', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      expect(screen.getByText('Add Client')).toBeInTheDocument()
      expect(screen.getByText('Add Work Entry')).toBeInTheDocument()
      expect(screen.getByText('View Reports')).toBeInTheDocument()
    })
  })

  it('should navigate to clients page when clicking Add Client button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Add Client'))

    expect(mockNavigate).toHaveBeenCalledWith('/clients')
  })

  it('should navigate to work entries page when clicking Add Work Entry button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Work Entry')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Add Work Entry'))

    expect(mockNavigate).toHaveBeenCalledWith('/work-entries')
  })

  it('should navigate to reports page when clicking View Reports button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('View Reports')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('View Reports'))

    expect(mockNavigate).toHaveBeenCalledWith('/reports')
  })

  it('should navigate to work entries when clicking Add Entry button in recent entries', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Entry')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Add Entry'))

    expect(mockNavigate).toHaveBeenCalledWith('/work-entries')
  })

  it('should only show first 5 recent entries', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, hours: 1, client_name: 'Client 1', date: '2024-01-01' },
        { id: 2, hours: 2, client_name: 'Client 2', date: '2024-01-02' },
        { id: 3, hours: 3, client_name: 'Client 3', date: '2024-01-03' },
        { id: 4, hours: 4, client_name: 'Client 4', date: '2024-01-04' },
        { id: 5, hours: 5, client_name: 'Client 5', date: '2024-01-05' },
        { id: 6, hours: 6, client_name: 'Client 6', date: '2024-01-06' },
      ],
    })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
      expect(screen.getByText('Client 5')).toBeInTheDocument()
      expect(screen.queryByText('Client 6')).not.toBeInTheDocument()
    })
  })
})
