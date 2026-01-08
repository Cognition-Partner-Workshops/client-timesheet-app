import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import WorkEntriesPage from './WorkEntriesPage'
import apiClient from '../api/client'

vi.mock('../api/client')

const mockApiClient = apiClient as {
  getClients: ReturnType<typeof vi.fn>
  getWorkEntries: ReturnType<typeof vi.fn>
  createWorkEntry: ReturnType<typeof vi.fn>
  updateWorkEntry: ReturnType<typeof vi.fn>
  deleteWorkEntry: ReturnType<typeof vi.fn>
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

const mockWorkEntries = [
  {
    id: 1,
    client_id: 1,
    client_name: 'Client A',
    hours: 5,
    description: 'Work on project',
    date: '2024-01-15',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    client_id: 2,
    client_name: 'Client B',
    hours: 3,
    description: 'Meeting',
    date: '2024-01-16',
    created_at: '2024-01-16T10:00:00Z',
  },
]

describe('WorkEntriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiClient.getClients.mockResolvedValue({ clients: mockClients })
    mockApiClient.getWorkEntries.mockResolvedValue({ workEntries: mockWorkEntries })
    mockApiClient.createWorkEntry.mockResolvedValue({ workEntry: mockWorkEntries[0] })
    mockApiClient.updateWorkEntry.mockResolvedValue({ workEntry: mockWorkEntries[0] })
    mockApiClient.deleteWorkEntry.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('should render loading state initially', () => {
      render(<WorkEntriesPage />, { wrapper: createWrapper() })
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should render work entries after loading', async () => {
      render(<WorkEntriesPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      expect(screen.getByText('Client B')).toBeInTheDocument()
    })

    it('should show empty state when no clients exist', async () => {
      mockApiClient.getClients.mockResolvedValue({ clients: [] })
      render(<WorkEntriesPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText(/create at least one client/i)).toBeInTheDocument()
      })
    })
  })

  describe('handleOpen', () => {
    it('should open dialog when Add Work Entry button is clicked', async () => {
      render(<WorkEntriesPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /add work entry/i })
      await userEvent.click(addButton)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Add New Work Entry')).toBeInTheDocument()
    })

    it('should open dialog with entry data when edit button is clicked', async () => {
      render(<WorkEntriesPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const editButtons = screen.getAllByTestId('EditIcon')
      await userEvent.click(editButtons[0].closest('button')!)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Edit Work Entry')).toBeInTheDocument()
    })
  })

  describe('handleClose', () => {
    it('should close dialog when Cancel button is clicked', async () => {
      render(<WorkEntriesPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /add work entry/i })
      await userEvent.click(addButton)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await userEvent.click(cancelButton)
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('handleDelete', () => {
    it('should call deleteWorkEntry when confirmed', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      
      render(<WorkEntriesPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const deleteButtons = screen.getAllByTestId('DeleteIcon')
      await userEvent.click(deleteButtons[0].closest('button')!)
      
      await waitFor(() => {
        expect(mockApiClient.deleteWorkEntry).toHaveBeenCalledWith(1)
      })
    })

    it('should not call deleteWorkEntry when cancelled', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      
      render(<WorkEntriesPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const deleteButtons = screen.getAllByTestId('DeleteIcon')
      await userEvent.click(deleteButtons[0].closest('button')!)
      
      expect(mockApiClient.deleteWorkEntry).not.toHaveBeenCalled()
    })
  })
})
