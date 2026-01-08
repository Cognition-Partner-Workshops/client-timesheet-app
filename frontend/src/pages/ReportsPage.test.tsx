import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import ReportsPage from './ReportsPage'
import apiClient from '../api/client'

vi.mock('../api/client')

const mockApiClient = apiClient as {
  getClients: ReturnType<typeof vi.fn>
  getClientReport: ReturnType<typeof vi.fn>
  exportClientReportCsv: ReturnType<typeof vi.fn>
  exportClientReportPdf: ReturnType<typeof vi.fn>
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

const mockClients = [
  { id: 1, name: 'Client A', description: 'Test client A' },
  { id: 2, name: 'Client B', description: 'Test client B' },
]

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiClient.getClients.mockResolvedValue({ clients: mockClients })
    mockApiClient.getClientReport.mockResolvedValue({
      client: { id: 1, name: 'Client A' },
      workEntries: [],
      totalHours: 0,
      entryCount: 0,
    })
    mockApiClient.exportClientReportCsv.mockResolvedValue(new Blob(['csv data']))
    mockApiClient.exportClientReportPdf.mockResolvedValue(new Blob(['pdf data']))
    
    global.URL.createObjectURL = vi.fn(() => 'blob:test-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  describe('rendering', () => {
    it('should render loading state initially', () => {
      render(<ReportsPage />, { wrapper: createWrapper() })
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should render page title after loading', async () => {
      render(<ReportsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Reports')).toBeInTheDocument()
      })
    })

    it('should show empty state when no clients exist', async () => {
      mockApiClient.getClients.mockResolvedValue({ clients: [] })
      render(<ReportsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText(/create at least one client/i)).toBeInTheDocument()
      })
    })

    it('should show prompt to select client when none selected', async () => {
      render(<ReportsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText(/select a client to view/i)).toBeInTheDocument()
      })
    })
  })
})
