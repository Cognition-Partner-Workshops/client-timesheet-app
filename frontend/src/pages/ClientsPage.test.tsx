import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import ClientsPage from './ClientsPage'

vi.mock('../api/client', () => ({
  default: {
    getClients: vi.fn(),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
  },
}))

import apiClient from '../api/client'

const mockClients = [
  { id: 1, name: 'Acme Corp', description: 'A test client', created_at: '2024-01-01T00:00:00.000Z', updated_at: '2024-01-01T00:00:00.000Z' },
  { id: 2, name: 'Tech Solutions', description: null, created_at: '2024-01-02T00:00:00.000Z', updated_at: '2024-01-02T00:00:00.000Z' },
]

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients })
    vi.mocked(apiClient.createClient).mockResolvedValue({ client: { id: 3, name: 'New Client', description: null, created_at: '2024-01-03', updated_at: '2024-01-03' } })
    vi.mocked(apiClient.updateClient).mockResolvedValue({ client: mockClients[0] })
    vi.mocked(apiClient.deleteClient).mockResolvedValue({ message: 'Deleted' })
  })

  it('should render page title', async () => {
    render(<ClientsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument()
    })
  })

  it('should show loading state initially', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}))
    render(<ClientsPage />)
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should display clients in table', async () => {
    render(<ClientsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Tech Solutions')).toBeInTheDocument()
    expect(screen.getByText('A test client')).toBeInTheDocument()
  })

  it('should show "No description" chip for clients without description', async () => {
    render(<ClientsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('No description')).toBeInTheDocument()
    })
  })

  it('should show empty state when no clients', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    render(<ClientsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/no clients found/i)).toBeInTheDocument()
    })
  })

  it('should open add client dialog', async () => {
    const user = userEvent.setup()
    render(<ClientsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument()
    })
    
    const addButton = screen.getByRole('button', { name: /add client/i })
    await user.click(addButton)
    
    expect(screen.getByText('Add New Client')).toBeInTheDocument()
    expect(screen.getByLabelText(/client name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('should create new client', async () => {
    const user = userEvent.setup()
    render(<ClientsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument()
    })
    
    const addButton = screen.getByRole('button', { name: /add client/i })
    await user.click(addButton)
    
    const nameInput = screen.getByLabelText(/client name/i)
    const descInput = screen.getByLabelText(/description/i)
    
    await user.type(nameInput, 'New Client')
    await user.type(descInput, 'New Description')
    
    const createButton = screen.getByRole('button', { name: /create/i })
    await user.click(createButton)
    
    await waitFor(() => {
      expect(apiClient.createClient).toHaveBeenCalledWith({
        name: 'New Client',
        description: 'New Description',
      })
    })
  })

  it('should open edit client dialog', async () => {
    const user = userEvent.setup()
    render(<ClientsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })
    
    const row = screen.getByText('Acme Corp').closest('tr')
    const buttons = within(row!).getAllByRole('button')
    const editButton = buttons[0]
    await user.click(editButton)
    
    await waitFor(() => {
      expect(screen.getByText('Edit Client')).toBeInTheDocument()
    })
  })

  it('should delete client with confirmation', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<ClientsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })
    
    const row = screen.getByText('Acme Corp').closest('tr')
    const buttons = within(row!).getAllByRole('button')
    const deleteButton = buttons[buttons.length - 1]
    await user.click(deleteButton)
    
    await waitFor(() => {
      expect(apiClient.deleteClient).toHaveBeenCalledWith(1)
    })
    
    confirmSpy.mockRestore()
  })

  it('should not delete client when confirmation cancelled', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<ClientsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })
    
    const row = screen.getByText('Acme Corp').closest('tr')
    const buttons = within(row!).getAllByRole('button')
    const deleteButton = buttons[buttons.length - 1]
    await user.click(deleteButton)
    
    expect(apiClient.deleteClient).not.toHaveBeenCalled()
    
    confirmSpy.mockRestore()
  })

  it('should close dialog on cancel', async () => {
    const user = userEvent.setup()
    render(<ClientsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument()
    })
    
    const addButton = screen.getByRole('button', { name: /add client/i })
    await user.click(addButton)
    
    expect(screen.getByText('Add New Client')).toBeInTheDocument()
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Add New Client')).not.toBeInTheDocument()
    })
  })

  it('should show error on create failure', async () => {
    vi.mocked(apiClient.createClient).mockRejectedValueOnce({
      response: { data: { error: 'Client already exists' } },
    })
    const user = userEvent.setup()
    render(<ClientsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument()
    })
    
    const addButton = screen.getByRole('button', { name: /add client/i })
    await user.click(addButton)
    
    const nameInput = screen.getByLabelText(/client name/i)
    await user.type(nameInput, 'Duplicate Client')
    
    const createButton = screen.getByRole('button', { name: /create/i })
    await user.click(createButton)
    
    await waitFor(() => {
      expect(screen.getByText('Client already exists')).toBeInTheDocument()
    })
  })


  it('should show error on delete failure', async () => {
    vi.mocked(apiClient.deleteClient).mockRejectedValueOnce({
      response: { data: { error: 'Delete failed' } },
    })
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    render(<ClientsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })
    
    const row = screen.getByText('Acme Corp').closest('tr')
    const buttons = within(row!).getAllByRole('button')
    const deleteButton = buttons[buttons.length - 1]
    await user.click(deleteButton)
    
    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument()
    })
    
    confirmSpy.mockRestore()
  })

})
