import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/testUtils';
import WorkEntriesPage from '../WorkEntriesPage';
import apiClient from '../../api/client';

vi.mock('../../api/client');

describe('WorkEntriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(apiClient.getWorkEntries).mockReturnValue(new Promise(() => {}));
    vi.mocked(apiClient.getClients).mockReturnValue(new Promise(() => {}));
    render(<WorkEntriesPage />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render work entries page title', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] });
    render(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Work Entries')).toBeInTheDocument();
    });
  });

  it('should show message when no clients exist', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    render(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText(/you need to create at least one client/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /create client/i })).toBeInTheDocument();
  });

  it('should show empty state when no work entries', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] });
    render(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText(/no work entries found/i)).toBeInTheDocument();
    });
  });

  it('should display work entries in table', async () => {
    const mockWorkEntries = [
      { id: 1, client_id: 1, client_name: 'Client A', hours: 5, date: '2024-01-01', description: 'Work done', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 2, client_id: 1, client_name: 'Client A', hours: 3, date: '2024-01-02', description: null, created_at: '2024-01-02', updated_at: '2024-01-02' },
    ];
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client A' }] });

    render(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Client A').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('5 hours')).toBeInTheDocument();
    expect(screen.getByText('3 hours')).toBeInTheDocument();
    expect(screen.getByText('Work done')).toBeInTheDocument();
    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('should open dialog when clicking Add Work Entry', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] });

    const user = userEvent.setup();
    render(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add work entry/i }));

    expect(screen.getByText('Add New Work Entry')).toBeInTheDocument();
  });

  it('should close dialog when clicking Cancel', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client 1' }] });

    const user = userEvent.setup();
    render(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add work entry/i }));
    expect(screen.getByText('Add New Work Entry')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText('Add New Work Entry')).not.toBeInTheDocument();
    });
  });

  it('should delete work entry after confirmation', async () => {
    const mockWorkEntries = [
      { id: 1, client_id: 1, client_name: 'Client A', hours: 5, date: '2024-01-01', description: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
    ];
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client A' }] });
    vi.mocked(apiClient.deleteWorkEntry).mockResolvedValue({ message: 'Deleted' });

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText('5 hours')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    if (deleteButton) {
      await user.click(deleteButton);
    }

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(apiClient.deleteWorkEntry).toHaveBeenCalledWith(1);
    });

    confirmSpy.mockRestore();
  });

  it('should not delete work entry when confirmation is cancelled', async () => {
    const mockWorkEntries = [
      { id: 1, client_id: 1, client_name: 'Client A', hours: 5, date: '2024-01-01', description: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
    ];
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client A' }] });

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    render(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText('5 hours')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    if (deleteButton) {
      await user.click(deleteButton);
    }

    expect(confirmSpy).toHaveBeenCalled();
    expect(apiClient.deleteWorkEntry).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('should open edit dialog when clicking edit button', async () => {
    const mockWorkEntries = [
      { id: 1, client_id: 1, client_name: 'Client A', hours: 5, date: '2024-01-01', description: 'Test description', created_at: '2024-01-01', updated_at: '2024-01-01' },
    ];
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Client A' }] });

    const user = userEvent.setup();
    render(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText('5 hours')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: '' });
    const editButton = editButtons.find(btn => btn.querySelector('[data-testid="EditIcon"]'));
    if (editButton) {
      await user.click(editButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Edit Work Entry')).toBeInTheDocument();
    });
  });

});
