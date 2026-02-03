import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '../test/test-utils'
import ReportsPage from './ReportsPage'

vi.mock('../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getClientReport: vi.fn(),
    exportClientReportCsv: vi.fn(),
    exportClientReportPdf: vi.fn(),
  },
}))

import apiClient from '../api/client'

const mockClients = [
  { id: 1, name: 'Acme Corp', description: 'Test', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 2, name: 'Tech Solutions', description: null, created_at: '2024-01-02', updated_at: '2024-01-02' },
]

const mockReport = {
  client: mockClients[0],
  workEntries: [
    { id: 1, client_id: 1, hours: 8, description: 'Development', date: '2024-01-15', created_at: '2024-01-15', updated_at: '2024-01-15' },
    { id: 2, client_id: 1, hours: 4, description: null, date: '2024-01-16', created_at: '2024-01-16', updated_at: '2024-01-16' },
  ],
  totalHours: 12,
  entryCount: 2,
}

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients })
    vi.mocked(apiClient.getClientReport).mockResolvedValue(mockReport)
    vi.mocked(apiClient.exportClientReportCsv).mockResolvedValue(new Blob(['csv'], { type: 'text/csv' }))
    vi.mocked(apiClient.exportClientReportPdf).mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }))
  })

  it('should render page title', async () => {
    render(<ReportsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument()
    })
  })

  it('should show loading state initially', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}))
    render(<ReportsPage />)
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should show message when no clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    render(<ReportsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/you need to create at least one client/i)).toBeInTheDocument()
    })
  })

  it('should display client selector', async () => {
    render(<ReportsPage />)
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  it('should show prompt to select client when none selected', async () => {
    render(<ReportsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/select a client to view their time report/i)).toBeInTheDocument()
    })
  })

  it('should display export buttons', async () => {
    render(<ReportsPage />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export as csv/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /export as pdf/i })).toBeInTheDocument()
    })
  })

  it('should disable export buttons when no client selected', async () => {
    render(<ReportsPage />)
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
    
    const csvButton = screen.getByRole('button', { name: /export as csv/i })
    const pdfButton = screen.getByRole('button', { name: /export as pdf/i })
    
    expect(csvButton).toBeDisabled()
    expect(pdfButton).toBeDisabled()
  })

  it('should call getClients on mount', async () => {
    render(<ReportsPage />)
    
    await waitFor(() => {
      expect(apiClient.getClients).toHaveBeenCalled()
    })
  })
})
