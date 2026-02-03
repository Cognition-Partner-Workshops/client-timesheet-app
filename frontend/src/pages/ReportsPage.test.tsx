import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ReportsPage from './ReportsPage'
import apiClient from '../api/client'

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
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

const renderReportsPage = () => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <ReportsPage />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    vi.mocked(apiClient.getClients).mockReturnValue(new Promise(() => {}))

    renderReportsPage()

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render reports page title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })

    renderReportsPage()

    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument()
    })
  })

  it('should show message when no clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })

    renderReportsPage()

    await waitFor(() => {
      expect(screen.getByText(/you need to create at least one client/i)).toBeInTheDocument()
    })
  })

  it('should show create client button when no clients', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })

    renderReportsPage()

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /create client/i })).toBeInTheDocument()
    })
  })

  it('should display client selection when clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ 
      clients: [{ id: 1, name: 'Client 1' }] 
    })

    renderReportsPage()

    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument()
    })

    expect(screen.getByText(/select a client/i)).toBeInTheDocument()
  })

  it('should show export buttons', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ 
      clients: [{ id: 1, name: 'Client 1' }] 
    })

    renderReportsPage()

    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /export as csv/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export as pdf/i })).toBeInTheDocument()
  })

  it('should have disabled export buttons when no client selected', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ 
      clients: [{ id: 1, name: 'Client 1' }] 
    })

    renderReportsPage()

    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument()
    })

    const csvButton = screen.getByRole('button', { name: /export as csv/i })
    const pdfButton = screen.getByRole('button', { name: /export as pdf/i })
    
    expect(csvButton).toBeDisabled()
    expect(pdfButton).toBeDisabled()
  })

  it('should display select client message when no client selected', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ 
      clients: [{ id: 1, name: 'Client 1' }] 
    })

    renderReportsPage()

    await waitFor(() => {
      expect(screen.getByText(/select a client to view their time report/i)).toBeInTheDocument()
    })
  })
})
