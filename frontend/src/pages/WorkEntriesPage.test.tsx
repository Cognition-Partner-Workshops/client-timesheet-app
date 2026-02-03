import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkEntriesPage from './WorkEntriesPage';
import { render } from '../test/test-utils';
import apiClient from '../api/client';

vi.mock('../api/client');

describe('WorkEntriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Test Client' }] });
    
    render(<WorkEntriesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Work Entries')).toBeInTheDocument();
    });
  });

  it('should show loading spinner initially', () => {
    vi.mocked(apiClient.getWorkEntries).mockImplementation(() => new Promise(() => {}));
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}));
    
    render(<WorkEntriesPage />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show message when no clients exist', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    
    render(<WorkEntriesPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/you need to create at least one client/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no work entries', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Test Client' }] });
    
    render(<WorkEntriesPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/no work entries found/i)).toBeInTheDocument();
    });
  });

  it('should display work entries in table', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Test Client', hours: 5, date: '2024-01-15', description: 'Test work' },
      ],
    });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Test Client' }] });
    
    render(<WorkEntriesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });
    
    expect(screen.getByText('5 hours')).toBeInTheDocument();
    expect(screen.getByText('Test work')).toBeInTheDocument();
  });

  it('should show "No description" chip when entry has no description', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Test Client', hours: 5, date: '2024-01-15', description: null },
      ],
    });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Test Client' }] });
    
    render(<WorkEntriesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No description')).toBeInTheDocument();
    });
  });

  it('should open add work entry dialog', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Test Client' }] });
    const user = userEvent.setup();
    
    render(<WorkEntriesPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /add work entry/i }));
    
    expect(screen.getByText('Add New Work Entry')).toBeInTheDocument();
  });

  it('should delete work entry when confirming', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Test Client', hours: 5, date: '2024-01-15', description: null },
      ],
    });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Test Client' }] });
    vi.mocked(apiClient.deleteWorkEntry).mockResolvedValue({});
    const user = userEvent.setup();
    
    window.confirm = vi.fn(() => true);
    
    render(<WorkEntriesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    await user.click(deleteButton!);
    
    await waitFor(() => {
      expect(apiClient.deleteWorkEntry).toHaveBeenCalledWith(1);
    });
  });

  it('should not delete work entry when canceling', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Test Client', hours: 5, date: '2024-01-15', description: null },
      ],
    });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Test Client' }] });
    const user = userEvent.setup();
    
    window.confirm = vi.fn(() => false);
    
    render(<WorkEntriesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    await user.click(deleteButton!);
    
    expect(apiClient.deleteWorkEntry).not.toHaveBeenCalled();
  });

  it('should close dialog when clicking Cancel', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Test Client' }] });
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

  it('should show error on delete failure', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Test Client', hours: 5, date: '2024-01-15', description: null },
      ],
    });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [{ id: 1, name: 'Test Client' }] });
    vi.mocked(apiClient.deleteWorkEntry).mockRejectedValue({
      response: { data: { error: 'Delete failed' } },
    });
    const user = userEvent.setup();
    
    window.confirm = vi.fn(() => true);
    
    render(<WorkEntriesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    await user.click(deleteButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });
  });
});
