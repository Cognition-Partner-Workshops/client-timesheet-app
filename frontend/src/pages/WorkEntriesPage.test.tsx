import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import WorkEntriesPage from './WorkEntriesPage'
import apiClient from '../api/client'
import React, { type ReactNode } from 'react'

vi.mock('../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getWorkEntries: vi.fn(),
    createWorkEntry: vi.fn(),
    updateWorkEntry: vi.fn(),
    deleteWorkEntry: vi.fn(),
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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <BrowserRouter>{children}</BrowserRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('WorkEntriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('should render work entries page title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Work Entries')).toBeInTheDocument()
    })
  })

  it('should show loading state', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}))
    vi.mocked(apiClient.getWorkEntries).mockImplementation(() => new Promise(() => {}))

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should show message when no clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/you need to create at least one client/i)).toBeInTheDocument()
    })
  })

  it('should display empty state when no work entries', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/no work entries found/i)).toBeInTheDocument()
    })
  })

  it('should display work entries in table', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client 1', hours: 4, description: 'Test work', date: '2024-01-01', created_at: '2024-01-01' },
      ],
    })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
      expect(screen.getByText('4 hours')).toBeInTheDocument()
      expect(screen.getByText('Test work')).toBeInTheDocument()
    })
  })

  it('should show "No description" chip for entries without description', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client 1', hours: 4, description: null, date: '2024-01-01', created_at: '2024-01-01' },
      ],
    })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('No description')).toBeInTheDocument()
    })
  })

  it('should open add work entry dialog when clicking Add Work Entry button', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Work Entry')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Add Work Entry'))

    expect(screen.getByText('Add New Work Entry')).toBeInTheDocument()
  })

  it('should show dialog title when adding entry', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Work Entry')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Add Work Entry'))

    await waitFor(() => {
      expect(screen.getByText('Add New Work Entry')).toBeInTheDocument()
    })
  })

  it('should show form fields in dialog', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Work Entry')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Add Work Entry'))
    
    await waitFor(() => {
      expect(screen.getByText('Add New Work Entry')).toBeInTheDocument()
    })
    
    expect(screen.getByLabelText(/hours/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should create work entry successfully', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })
    vi.mocked(apiClient.createWorkEntry).mockResolvedValue({ workEntry: { id: 1 } })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Work Entry')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Add Work Entry'))
    
    await waitFor(() => {
      expect(screen.getByText('Add New Work Entry')).toBeInTheDocument()
    })
    
    // Select client using mouseDown on the select element
    const selectElement = document.querySelector('[role="combobox"]')
    expect(selectElement).toBeInTheDocument()
    fireEvent.mouseDown(selectElement!)
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    
    const option = screen.getByRole('option', { name: 'Client 1' })
    await user.click(option)
    
    const hoursInput = screen.getByLabelText(/hours/i)
    await user.type(hoursInput, '4')
    
    await user.click(screen.getByText('Create'))

    await waitFor(() => {
      expect(apiClient.createWorkEntry).toHaveBeenCalled()
    })
  })

  it('should open edit dialog with entry data', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client 1', hours: 4, description: 'Test work', date: '2024-01-01', created_at: '2024-01-01' },
      ],
    })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: '' })
    const editButton = editButtons.find((btn) => btn.querySelector('[data-testid="EditIcon"]'))
    await user.click(editButton!)

    expect(screen.getByText('Edit Work Entry')).toBeInTheDocument()
    expect(screen.getByDisplayValue('4')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test work')).toBeInTheDocument()
  })

  it('should update work entry successfully', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client 1', hours: 4, description: 'Test work', date: '2024-01-01', created_at: '2024-01-01' },
      ],
    })
    vi.mocked(apiClient.updateWorkEntry).mockResolvedValue({ workEntry: { id: 1 } })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: '' })
    const editButton = editButtons.find((btn) => btn.querySelector('[data-testid="EditIcon"]'))
    await user.click(editButton!)

    const hoursInput = screen.getByDisplayValue('4')
    await user.clear(hoursInput)
    await user.type(hoursInput, '8')
    await user.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(apiClient.updateWorkEntry).toHaveBeenCalled()
    })
  })

  it('should delete work entry when confirmed', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client 1', hours: 4, description: null, date: '2024-01-01', created_at: '2024-01-01' },
      ],
    })
    vi.mocked(apiClient.deleteWorkEntry).mockResolvedValue({ message: 'Deleted' })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    const deleteButton = deleteButtons.find((btn) => btn.querySelector('[data-testid="DeleteIcon"]'))
    await user.click(deleteButton!)

    await waitFor(() => {
      expect(apiClient.deleteWorkEntry).toHaveBeenCalledWith(1)
    })
  })

  it('should not delete work entry when not confirmed', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client 1', hours: 4, description: null, date: '2024-01-01', created_at: '2024-01-01' },
      ],
    })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    const deleteButton = deleteButtons.find((btn) => btn.querySelector('[data-testid="DeleteIcon"]'))
    await user.click(deleteButton!)

    expect(apiClient.deleteWorkEntry).not.toHaveBeenCalled()
  })

  it('should close dialog when clicking Cancel', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Work Entry')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Add Work Entry'))
    expect(screen.getByText('Add New Work Entry')).toBeInTheDocument()

    await user.click(screen.getByText('Cancel'))

    await waitFor(() => {
      expect(screen.queryByText('Add New Work Entry')).not.toBeInTheDocument()
    })
  })

  it('should show error on create failure', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })
    vi.mocked(apiClient.createWorkEntry).mockRejectedValue({
      response: { data: { error: 'Create failed' } },
    })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Work Entry')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Add Work Entry'))
    
    await waitFor(() => {
      expect(screen.getByText('Add New Work Entry')).toBeInTheDocument()
    })
    
    // Select client using mouseDown on the select element
    const selectElement = document.querySelector('[role="combobox"]')
    expect(selectElement).toBeInTheDocument()
    fireEvent.mouseDown(selectElement!)
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
    
    const option = screen.getByRole('option', { name: 'Client 1' })
    await user.click(option)
    
    const hoursInput = screen.getByLabelText(/hours/i)
    await user.type(hoursInput, '4')
    
    await user.click(screen.getByText('Create'))

    await waitFor(() => {
      expect(screen.getByText('Create failed')).toBeInTheDocument()
    })
  })

  it('should show error on delete failure', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client 1', hours: 4, description: null, date: '2024-01-01', created_at: '2024-01-01' },
      ],
    })
    vi.mocked(apiClient.deleteWorkEntry).mockRejectedValue({
      response: { data: { error: 'Delete failed' } },
    })

    render(
      <TestWrapper>
        <WorkEntriesPage />
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

  it('should display table headers', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Client')).toBeInTheDocument()
      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getByText('Hours')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
  })

  it('should have Create Client link when no clients', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })

    render(
      <TestWrapper>
        <WorkEntriesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Create Client')).toBeInTheDocument()
    })
  })
})
