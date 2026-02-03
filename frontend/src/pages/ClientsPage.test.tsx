import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ClientsPage from './ClientsPage'
import apiClient from '../api/client'

vi.mock('../api/client', () => ({
  default: {
    getClients: vi.fn(),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
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

const renderClientsPage = () => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <ClientsPage />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    vi.mocked(apiClient.getClients).mockReturnValue(new Promise(() => {}))

    renderClientsPage()

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render clients page title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })

    renderClientsPage()

    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument()
    })
  })

  it('should render add client button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })

    renderClientsPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument()
    })
  })

  it('should display empty state when no clients', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })

    renderClientsPage()

    await waitFor(() => {
      expect(screen.getByText(/no clients found/i)).toBeInTheDocument()
    })
  })

  it('should display clients in table', async () => {
    const mockClients = [
      { id: 1, name: 'Client 1', description: 'Description 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 2, name: 'Client 2', description: null, created_at: '2024-01-02', updated_at: '2024-01-02' },
    ]
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: mockClients })

    renderClientsPage()

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    expect(screen.getByText('Client 2')).toBeInTheDocument()
    expect(screen.getByText('Description 1')).toBeInTheDocument()
    expect(screen.getByText('No description')).toBeInTheDocument()
  })

  it('should open add client dialog', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })

    renderClientsPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /add client/i }))

    expect(screen.getByText('Add New Client')).toBeInTheDocument()
  })

  it('should show create and cancel buttons in dialog', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })

    renderClientsPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /add client/i }))

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('should close dialog when clicking Cancel', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })

    renderClientsPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /add client/i }))
    expect(screen.getByText('Add New Client')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByText('Add New Client')).not.toBeInTheDocument()
    })
  })

  it('should delete client after confirmation', async () => {
    const mockClients = [
      { id: 1, name: 'Client 1', description: 'Description 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
    ]
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: mockClients })
    vi.mocked(apiClient.deleteClient).mockResolvedValueOnce({ message: 'Deleted' })
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderClientsPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'))
    await user.click(deleteButton!)

    expect(confirmSpy).toHaveBeenCalled()
    await waitFor(() => {
      expect(apiClient.deleteClient).toHaveBeenCalledWith(1)
    })

    confirmSpy.mockRestore()
  })

  it('should not delete client when confirmation is cancelled', async () => {
    const mockClients = [
      { id: 1, name: 'Client 1', description: 'Description 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
    ]
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: mockClients })

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderClientsPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'))
    await user.click(deleteButton!)

    expect(apiClient.deleteClient).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('should open edit dialog with client data', async () => {
    const mockClients = [
      { id: 1, name: 'Client 1', description: 'Description 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
    ]
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: mockClients })

    renderClientsPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: '' })
    const editButton = editButtons.find(btn => btn.querySelector('[data-testid="EditIcon"]'))
    await user.click(editButton!)

    expect(screen.getByText('Edit Client')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Client 1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Description 1')).toBeInTheDocument()
  })

  it('should display table headers correctly', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })

    renderClientsPage()

    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument()
    })

    expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /description/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /created/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument()
  })
})
