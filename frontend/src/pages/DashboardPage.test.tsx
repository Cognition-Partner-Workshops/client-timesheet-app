import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import DashboardPage from './DashboardPage'

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

import apiClient from '../api/client'

const mockClients = [
  { id: 1, name: 'Client A', description: 'Test', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 2, name: 'Client B', description: null, created_at: '2024-01-02', updated_at: '2024-01-02' },
]

const mockWorkEntries = [
  { id: 1, client_id: 1, client_name: 'Client A', hours: 8, description: 'Work', date: '2024-01-15', created_at: '2024-01-15', updated_at: '2024-01-15' },
  { id: 2, client_id: 1, client_name: 'Client A', hours: 4, description: null, date: '2024-01-16', created_at: '2024-01-16', updated_at: '2024-01-16' },
  { id: 3, client_id: 2, client_name: 'Client B', hours: 6, description: 'Meeting', date: '2024-01-17', created_at: '2024-01-17', updated_at: '2024-01-17' },
]

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries })
  })

  it('should render dashboard title', async () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should display total clients count', async () => {
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Clients')).toBeInTheDocument()
    })
  })

  it('should display total work entries count', async () => {
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Work Entries')).toBeInTheDocument()
    })
  })

  it('should display total hours', async () => {
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Hours')).toBeInTheDocument()
    })
  })

  it('should display recent work entries', async () => {
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Recent Work Entries')).toBeInTheDocument()
    })
  })

  it('should show "No work entries yet" when empty', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('No work entries yet')).toBeInTheDocument()
    })
  })

  it('should display quick actions', async () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view reports/i })).toBeInTheDocument()
  })

  it('should navigate to clients page when clicking Add Client button', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)
    
    const addClientButton = screen.getByRole('button', { name: /add client/i })
    await user.click(addClientButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/clients')
  })

  it('should navigate to work entries page when clicking Add Work Entry button', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)
    
    const addEntryButton = screen.getByRole('button', { name: /add work entry/i })
    await user.click(addEntryButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/work-entries')
  })

  it('should navigate to reports page when clicking View Reports button', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)
    
    const viewReportsButton = screen.getByRole('button', { name: /view reports/i })
    await user.click(viewReportsButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/reports')
  })

  it('should handle empty clients list', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })
})
