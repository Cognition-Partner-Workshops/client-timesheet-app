import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import ClientsPage from './ClientsPage'
import apiClient from '../api/client'

vi.mock('../api/client')

const mockApiClient = apiClient as {
  getClients: ReturnType<typeof vi.fn>
  createClient: ReturnType<typeof vi.fn>
  updateClient: ReturnType<typeof vi.fn>
  deleteClient: ReturnType<typeof vi.fn>
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
  { id: 1, name: 'Client A', description: 'Test client A', created_at: '2024-01-15T10:00:00Z' },
  { id: 2, name: 'Client B', description: 'Test client B', created_at: '2024-01-16T10:00:00Z' },
]

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiClient.getClients.mockResolvedValue({ clients: mockClients })
    mockApiClient.createClient.mockResolvedValue({ client: mockClients[0] })
    mockApiClient.updateClient.mockResolvedValue({ client: mockClients[0] })
    mockApiClient.deleteClient.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('should render loading state initially', () => {
      render(<ClientsPage />, { wrapper: createWrapper() })
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should render clients after loading', async () => {
      render(<ClientsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      expect(screen.getByText('Client B')).toBeInTheDocument()
    })

    it('should show empty state when no clients exist', async () => {
      mockApiClient.getClients.mockResolvedValue({ clients: [] })
      render(<ClientsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText(/no clients found/i)).toBeInTheDocument()
      })
    })
  })

  describe('handleOpen', () => {
    it('should open dialog when Add Client button is clicked', async () => {
      render(<ClientsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /add client/i })
      await userEvent.click(addButton)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Add New Client')).toBeInTheDocument()
    })

    it('should open dialog with client data when edit button is clicked', async () => {
      render(<ClientsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const editButtons = screen.getAllByTestId('EditIcon')
      await userEvent.click(editButtons[0].closest('button')!)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Edit Client')).toBeInTheDocument()
    })

    it('should populate form with client data when editing', async () => {
      render(<ClientsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const editButtons = screen.getAllByTestId('EditIcon')
      await userEvent.click(editButtons[0].closest('button')!)
      
      const nameInput = screen.getByLabelText(/client name/i)
      expect(nameInput).toHaveValue('Client A')
    })

    it('should reset form when opening for new client', async () => {
      render(<ClientsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /add client/i })
      await userEvent.click(addButton)
      
      const nameInput = screen.getByLabelText(/client name/i)
      expect(nameInput).toHaveValue('')
    })
  })

  describe('handleClose', () => {
    it('should close dialog when Cancel button is clicked', async () => {
      render(<ClientsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /add client/i })
      await userEvent.click(addButton)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await userEvent.click(cancelButton)
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should reset form data when dialog is closed', async () => {
      render(<ClientsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /add client/i })
      await userEvent.click(addButton)
      
      const nameInput = screen.getByLabelText(/client name/i)
      await userEvent.type(nameInput, 'Test')
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await userEvent.click(cancelButton)
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('handleSubmit', () => {
    it('should call createClient when form is valid for new client', async () => {
      render(<ClientsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /add client/i })
      await userEvent.click(addButton)
      
      const nameInput = screen.getByLabelText(/client name/i)
      await userEvent.type(nameInput, 'New Client')
      
      const createButton = screen.getByRole('button', { name: /create/i })
      await userEvent.click(createButton)
      
      await waitFor(() => {
        expect(mockApiClient.createClient).toHaveBeenCalledWith({
          name: 'New Client',
          description: undefined,
        })
      })
    })

    it('should call updateClient when form is valid for existing client', async () => {
      render(<ClientsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const editButtons = screen.getAllByTestId('EditIcon')
      await userEvent.click(editButtons[0].closest('button')!)
      
      const nameInput = screen.getByLabelText(/client name/i)
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'Updated Client')
      
      const updateButton = screen.getByRole('button', { name: /update/i })
      await userEvent.click(updateButton)
      
      await waitFor(() => {
        expect(mockApiClient.updateClient).toHaveBeenCalled()
      })
    })
  })

  describe('handleDelete', () => {
    it('should call deleteClient when confirmed', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      
      render(<ClientsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const deleteButtons = screen.getAllByTestId('DeleteIcon')
      await userEvent.click(deleteButtons[0].closest('button')!)
      
      await waitFor(() => {
        expect(mockApiClient.deleteClient).toHaveBeenCalledWith(1)
      })
    })

    it('should not call deleteClient when cancelled', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      
      render(<ClientsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const deleteButtons = screen.getAllByTestId('DeleteIcon')
      await userEvent.click(deleteButtons[0].closest('button')!)
      
      expect(mockApiClient.deleteClient).not.toHaveBeenCalled()
    })

    it('should show confirmation dialog with client name', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
      
      render(<ClientsPage />, { wrapper: createWrapper() })
      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument()
      })
      
      const deleteButtons = screen.getAllByTestId('DeleteIcon')
      await userEvent.click(deleteButtons[0].closest('button')!)
      
      expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('Client A'))
    })
  })
})
