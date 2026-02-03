import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ClientsPage from './ClientsPage'
import apiClient from '../api/client'
import React, { type ReactNode } from 'react'

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

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('should render clients page title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument()
    })
  })

  it('should show loading state', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}))

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should display empty state when no clients', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/no clients found/i)).toBeInTheDocument()
    })
  })

  it('should display clients in table', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Client 1', description: 'Description 1', created_at: '2024-01-01' },
        { id: 2, name: 'Client 2', description: null, created_at: '2024-01-02' },
      ],
    })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
      expect(screen.getByText('Client 2')).toBeInTheDocument()
      expect(screen.getByText('Description 1')).toBeInTheDocument()
    })
  })

  it('should show "No description" chip for clients without description', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1', description: null, created_at: '2024-01-01' }],
    })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('No description')).toBeInTheDocument()
    })
  })

  it('should open add client dialog when clicking Add Client button', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Add Client'))

    expect(screen.getByText('Add New Client')).toBeInTheDocument()
  })

  it('should create client successfully', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.createClient).mockResolvedValue({ client: { id: 1, name: 'New Client' } })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Add Client'))
    await user.type(screen.getByLabelText(/client name/i), 'New Client')
    await user.type(screen.getByLabelText(/description/i), 'New Description')
    await user.click(screen.getByText('Create'))

    await waitFor(() => {
      expect(apiClient.createClient).toHaveBeenCalledWith({
        name: 'New Client',
        description: 'New Description',
      })
    })
  })

  it('should show dialog with form fields', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Add Client'))

    await waitFor(() => {
      expect(screen.getByLabelText(/client name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })
  })

  it('should open edit dialog with client data', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1', description: 'Description 1', created_at: '2024-01-01' }],
    })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: '' })
    const editButton = editButtons.find((btn) => btn.querySelector('[data-testid="EditIcon"]'))
    await user.click(editButton!)

    expect(screen.getByText('Edit Client')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Client 1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Description 1')).toBeInTheDocument()
  })

  it('should update client successfully', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1', description: 'Description 1', created_at: '2024-01-01' }],
    })
    vi.mocked(apiClient.updateClient).mockResolvedValue({ client: { id: 1, name: 'Updated Client' } })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: '' })
    const editButton = editButtons.find((btn) => btn.querySelector('[data-testid="EditIcon"]'))
    await user.click(editButton!)

    const nameInput = screen.getByDisplayValue('Client 1')
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Client')
    await user.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(apiClient.updateClient).toHaveBeenCalledWith(1, {
        name: 'Updated Client',
        description: 'Description 1',
      })
    })
  })

  it('should delete client when confirmed', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1', description: null, created_at: '2024-01-01' }],
    })
    vi.mocked(apiClient.deleteClient).mockResolvedValue({ message: 'Deleted' })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    const deleteButton = deleteButtons.find((btn) => btn.querySelector('[data-testid="DeleteIcon"]'))
    await user.click(deleteButton!)

    await waitFor(() => {
      expect(apiClient.deleteClient).toHaveBeenCalledWith(1)
    })
  })

  it('should not delete client when not confirmed', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1', description: null, created_at: '2024-01-01' }],
    })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    const deleteButton = deleteButtons.find((btn) => btn.querySelector('[data-testid="DeleteIcon"]'))
    await user.click(deleteButton!)

    expect(apiClient.deleteClient).not.toHaveBeenCalled()
  })

  it('should close dialog when clicking Cancel', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Add Client'))
    expect(screen.getByText('Add New Client')).toBeInTheDocument()

    await user.click(screen.getByText('Cancel'))

    await waitFor(() => {
      expect(screen.queryByText('Add New Client')).not.toBeInTheDocument()
    })
  })

  it('should show error on create failure', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.createClient).mockRejectedValue({
      response: { data: { error: 'Create failed' } },
    })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Add Client'))
    await user.type(screen.getByLabelText(/client name/i), 'New Client')
    await user.click(screen.getByText('Create'))

    await waitFor(() => {
      expect(screen.getByText('Create failed')).toBeInTheDocument()
    })
  })

  it('should show error on update failure', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1', description: null, created_at: '2024-01-01' }],
    })
    vi.mocked(apiClient.updateClient).mockRejectedValue({
      response: { data: { error: 'Update failed' } },
    })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: '' })
    const editButton = editButtons.find((btn) => btn.querySelector('[data-testid="EditIcon"]'))
    await user.click(editButton!)

    await user.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument()
    })
  })

  it('should show error on delete failure', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1', description: null, created_at: '2024-01-01' }],
    })
    vi.mocked(apiClient.deleteClient).mockRejectedValue({
      response: { data: { error: 'Delete failed' } },
    })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    const deleteButton = deleteButtons.find((btn) => btn.querySelector('[data-testid="DeleteIcon"]'))
    await user.click(deleteButton!)

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument()
    })
  })

  it('should clear error when closing alert', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1', description: null, created_at: '2024-01-01' }],
    })
    vi.mocked(apiClient.deleteClient).mockRejectedValue({
      response: { data: { error: 'Delete failed' } },
    })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    const deleteButton = deleteButtons.find((btn) => btn.querySelector('[data-testid="DeleteIcon"]'))
    await user.click(deleteButton!)

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument()
    })

    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Delete failed')).not.toBeInTheDocument()
    })
  })

  it('should display table headers', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })

    render(
      <TestWrapper>
        <ClientsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Created')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
  })
})
