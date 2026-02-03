import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ReportsPage from './ReportsPage'
import apiClient from '../api/client'
import React from 'react'

vi.mock('../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getClientReport: vi.fn(),
    exportClientReportCsv: vi.fn(),
    exportClientReportPdf: vi.fn(),
  },
}))

const theme = createTheme()

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>{children}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render reports page title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })

    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument()
    })
  })

  it('should show loading state', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}))

    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should show message when no clients', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })

    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/You need to create at least one client/)).toBeInTheDocument()
    })
  })

  it('should display client selector when clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1' }],
    })

    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  it('should display export buttons', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1' }],
    })

    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('DescriptionIcon')).toBeInTheDocument()
      expect(screen.getByTestId('PictureAsPdfIcon')).toBeInTheDocument()
    })
  })

  it('should show select a client message when no client selected', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1' }],
    })

    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/Select a client to view their time report/)).toBeInTheDocument()
    })
  })

  it('should show Create Client link when no clients', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })

    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Create Client')).toBeInTheDocument()
    })
  })
})
