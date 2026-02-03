import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import WorkEntriesPage from './WorkEntriesPage'

vi.mock('../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getWorkEntries: vi.fn(),
    createWorkEntry: vi.fn(),
    updateWorkEntry: vi.fn(),
    deleteWorkEntry: vi.fn(),
  },
}))

import apiClient from '../api/client'

const mockClients = [
  { id: 1, name: 'Acme Corp', description: 'Test', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 2, name: 'Tech Solutions', description: null, created_at: '2024-01-02', updated_at: '2024-01-02' },
]

const mockWorkEntries = [
  { id: 1, client_id: 1, client_name: 'Acme Corp', hours: 8, description: 'Development', date: '2024-01-15', created_at: '2024-01-15', updated_at: '2024-01-15' },
  { id: 2, client_id: 2, client_name: 'Tech Solutions', hours: 4, description: null, date: '2024-01-16', created_at: '2024-01-16', updated_at: '2024-01-16' },
]

describe('WorkEntriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients })
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries })
    vi.mocked(apiClient.createWorkEntry).mockResolvedValue({ workEntry: mockWorkEntries[0] })
    vi.mocked(apiClient.updateWorkEntry).mockResolvedValue({ workEntry: mockWorkEntries[0] })
    vi.mocked(apiClient.deleteWorkEntry).mockResolvedValue({ message: 'Deleted' })
  })

  it('should render page title', async () => {
    render(<WorkEntriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Work Entries')).toBeInTheDocument()
    })
  })

  it('should show loading state initially', () => {
    vi.mocked(apiClient.getWorkEntries).mockImplementation(() => new Promise(() => {}))
    render(<WorkEntriesPage />)
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should display work entries in table', async () => {
    render(<WorkEntriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Tech Solutions')).toBeInTheDocument()
    expect(screen.getByText('Development')).toBeInTheDocument()
    expect(screen.getByText('8 hours')).toBeInTheDocument()
    expect(screen.getByText('4 hours')).toBeInTheDocument()
  })

  it('should show "No description" chip for entries without description', async () => {
    render(<WorkEntriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('No description')).toBeInTheDocument()
    })
  })

  it('should show empty state when no work entries', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] })
    render(<WorkEntriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/no work entries found/i)).toBeInTheDocument()
    })
  })

  it('should show message when no clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] })
    render(<WorkEntriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/you need to create at least one client/i)).toBeInTheDocument()
    })
  })

  it('should open add work entry dialog', async () => {
    const user = userEvent.setup()
    render(<WorkEntriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Work Entries')).toBeInTheDocument()
    })
    
    const addButton = screen.getByRole('button', { name: /add work entry/i })
    await user.click(addButton)
    
    expect(screen.getByText('Add New Work Entry')).toBeInTheDocument()
  })

  it('should close dialog on cancel', async () => {
    const user = userEvent.setup()
    render(<WorkEntriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Work Entries')).toBeInTheDocument()
    })
    
    const addButton = screen.getByRole('button', { name: /add work entry/i })
    await user.click(addButton)
    
    expect(screen.getByText('Add New Work Entry')).toBeInTheDocument()
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Add New Work Entry')).not.toBeInTheDocument()
    })
  })

  it('should delete work entry with confirmation', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<WorkEntriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })
    
    const row = screen.getByText('Acme Corp').closest('tr')
    const buttons = within(row!).getAllByRole('button')
    const deleteButton = buttons[buttons.length - 1]
    await user.click(deleteButton)
    
    await waitFor(() => {
      expect(apiClient.deleteWorkEntry).toHaveBeenCalledWith(1)
    })
    
    confirmSpy.mockRestore()
  })

  it('should not delete when confirmation cancelled', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<WorkEntriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })
    
    const row = screen.getByText('Acme Corp').closest('tr')
    const buttons = within(row!).getAllByRole('button')
    const deleteButton = buttons[buttons.length - 1]
    await user.click(deleteButton)
    
    expect(apiClient.deleteWorkEntry).not.toHaveBeenCalled()
    
    confirmSpy.mockRestore()
  })

  it('should show error on delete failure', async () => {
    vi.mocked(apiClient.deleteWorkEntry).mockRejectedValueOnce({
      response: { data: { error: 'Delete failed' } },
    })
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    render(<WorkEntriesPage />)
    
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

  it('should open edit dialog with existing data', async () => {
    const user = userEvent.setup()
    render(<WorkEntriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })
    
    const row = screen.getByText('Acme Corp').closest('tr')
    const editButton = within(row!).getAllByRole('button')[0]
    await user.click(editButton)
    
    await waitFor(() => {
      expect(screen.getByText('Edit Work Entry')).toBeInTheDocument()
    })
    
    expect(screen.getByLabelText(/hours/i)).toHaveValue(8)
  })

  it('should update work entry', async () => {
    const user = userEvent.setup()
    render(<WorkEntriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })
    
    const row = screen.getByText('Acme Corp').closest('tr')
    const editButton = within(row!).getAllByRole('button')[0]
    await user.click(editButton)
    
    await waitFor(() => {
      expect(screen.getByText('Edit Work Entry')).toBeInTheDocument()
    })
    
    const hoursInput = screen.getByLabelText(/hours/i)
    await user.clear(hoursInput)
    await user.type(hoursInput, '10')
    
    const updateButton = screen.getByRole('button', { name: /update/i })
    await user.click(updateButton)
    
    await waitFor(() => {
      expect(apiClient.updateWorkEntry).toHaveBeenCalled()
    })
  })

  it('should show error on update failure', async () => {
    vi.mocked(apiClient.updateWorkEntry).mockRejectedValueOnce({
      response: { data: { error: 'Update failed' } },
    })
    const user = userEvent.setup()
    render(<WorkEntriesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })
    
    const row = screen.getByText('Acme Corp').closest('tr')
    const editButton = within(row!).getAllByRole('button')[0]
    await user.click(editButton)
    
    await waitFor(() => {
      expect(screen.getByText('Edit Work Entry')).toBeInTheDocument()
    })
    
    const updateButton = screen.getByRole('button', { name: /update/i })
    await user.click(updateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument()
    })
  })
})
