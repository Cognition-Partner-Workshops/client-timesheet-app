import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import WorkEntriesPage from './WorkEntriesPage'
import apiClient from '../api/client'

vi.mock('../api/client', () => ({
  default: {
    getWorkEntries: vi.fn(),
    getClients: vi.fn(),
    createWorkEntry: vi.fn(),
    updateWorkEntry: vi.fn(),
    deleteWorkEntry: vi.fn(),
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

const renderWorkEntriesPage = () => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <BrowserRouter>
            <WorkEntriesPage />
          </BrowserRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('WorkEntriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    vi.mocked(apiClient.getWorkEntries).mockReturnValue(new Promise(() => {}))
    vi.mocked(apiClient.getClients).mockReturnValue(new Promise(() => {}))

    renderWorkEntriesPage()

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render work entries page title and add button', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [{ id: 1, name: 'Client 1' }] })

    renderWorkEntriesPage()

    await waitFor(() => {
      expect(screen.getByText('Work Entries')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument()
  })

  it('should show message when no clients exist', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [] })

    renderWorkEntriesPage()

    await waitFor(() => {
      expect(screen.getByText(/you need to create at least one client/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /create client/i })).toBeInTheDocument()
  })

  it('should display empty state when no work entries', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [{ id: 1, name: 'Client 1' }] })

    renderWorkEntriesPage()

    await waitFor(() => {
      expect(screen.getByText(/no work entries found/i)).toBeInTheDocument()
    })
  })

  it('should display work entries in table', async () => {
    const mockWorkEntries = [
      { id: 1, client_id: 1, hours: 5, date: '2024-01-01', description: 'Work 1', client_name: 'Client 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 2, client_id: 1, hours: 3, date: '2024-01-02', description: null, client_name: 'Client 1', created_at: '2024-01-02', updated_at: '2024-01-02' },
    ]
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: mockWorkEntries })
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [{ id: 1, name: 'Client 1' }] })

    renderWorkEntriesPage()

    await waitFor(() => {
      expect(screen.getAllByText('Client 1').length).toBeGreaterThan(0)
    })

    expect(screen.getByText('5 hours')).toBeInTheDocument()
    expect(screen.getByText('3 hours')).toBeInTheDocument()
    expect(screen.getByText('Work 1')).toBeInTheDocument()
    expect(screen.getByText('No description')).toBeInTheDocument()
  })

  it('should open add work entry dialog', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [{ id: 1, name: 'Client 1' }] })

    renderWorkEntriesPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /add work entry/i }))

    expect(screen.getByText('Add New Work Entry')).toBeInTheDocument()
  })

  it('should show dialog with form fields', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [{ id: 1, name: 'Client 1' }] })

    renderWorkEntriesPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /add work entry/i }))

    expect(screen.getByText('Add New Work Entry')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('should delete work entry after confirmation', async () => {
    const mockWorkEntries = [
      { id: 1, client_id: 1, hours: 5, date: '2024-01-01', description: null, client_name: 'Client 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
    ]
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: mockWorkEntries })
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [{ id: 1, name: 'Client 1' }] })
    vi.mocked(apiClient.deleteWorkEntry).mockResolvedValueOnce({ message: 'Deleted' })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderWorkEntriesPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('5 hours')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'))
    await user.click(deleteButton!)

    expect(confirmSpy).toHaveBeenCalled()
    await waitFor(() => {
      expect(apiClient.deleteWorkEntry).toHaveBeenCalledWith(1)
    })

    confirmSpy.mockRestore()
  })

  it('should close dialog when clicking Cancel', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [{ id: 1, name: 'Client 1' }] })

    renderWorkEntriesPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /add work entry/i }))
    expect(screen.getByText('Add New Work Entry')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByText('Add New Work Entry')).not.toBeInTheDocument()
    })
  })

  it('should open edit dialog with entry data', async () => {
    const mockWorkEntries = [
      { id: 1, client_id: 1, hours: 5, date: '2024-01-15', description: 'Test work', client_name: 'Client 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
    ]
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: mockWorkEntries })
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [{ id: 1, name: 'Client 1' }] })

    renderWorkEntriesPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('5 hours')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: '' })
    const editButton = editButtons.find(btn => btn.querySelector('[data-testid="EditIcon"]'))
    await user.click(editButton!)

    expect(screen.getByText('Edit Work Entry')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test work')).toBeInTheDocument()
  })

  it('should not delete work entry when confirmation is cancelled', async () => {
    const mockWorkEntries = [
      { id: 1, client_id: 1, hours: 5, date: '2024-01-01', description: null, client_name: 'Client 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
    ]
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: mockWorkEntries })
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [{ id: 1, name: 'Client 1' }] })

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderWorkEntriesPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('5 hours')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'))
    await user.click(deleteButton!)

    expect(apiClient.deleteWorkEntry).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('should display table headers correctly', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValueOnce({ workEntries: [] })
    vi.mocked(apiClient.getClients).mockResolvedValueOnce({ clients: [{ id: 1, name: 'Client 1' }] })

    renderWorkEntriesPage()

    await waitFor(() => {
      expect(screen.getByText('Work Entries')).toBeInTheDocument()
    })

    expect(screen.getByRole('columnheader', { name: /client/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /date/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /hours/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /description/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument()
  })
})
