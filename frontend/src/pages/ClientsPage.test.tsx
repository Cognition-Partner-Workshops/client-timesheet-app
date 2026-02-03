import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClientsPage from './ClientsPage';
import { render } from '../test/test-utils';
import apiClient from '../api/client';

vi.mock('../api/client');

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    
    render(<ClientsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument();
    });
  });

  it('should show loading spinner initially', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}));
    
    render(<ClientsPage />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display empty state when no clients', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    
    render(<ClientsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/no clients found/i)).toBeInTheDocument();
    });
  });

  it('should display clients in table', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Test Client', description: 'Test description', created_at: '2024-01-01' },
      ],
    });
    
    render(<ClientsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should show "No description" chip when client has no description', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Test Client', description: null, created_at: '2024-01-01' },
      ],
    });
    
    render(<ClientsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No description')).toBeInTheDocument();
    });
  });

  it('should open add client dialog when clicking Add Client button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    const user = userEvent.setup();
    
    render(<ClientsPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /add client/i }));
    
    expect(screen.getByText('Add New Client')).toBeInTheDocument();
  });

  it('should delete client when confirming', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Test Client', description: null, created_at: '2024-01-01' },
      ],
    });
    vi.mocked(apiClient.deleteClient).mockResolvedValue({});
    const user = userEvent.setup();
    
    window.confirm = vi.fn(() => true);
    
    render(<ClientsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    await user.click(deleteButton!);
    
    await waitFor(() => {
      expect(apiClient.deleteClient).toHaveBeenCalledWith(1);
    });
  });

  it('should not delete client when canceling', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Test Client', description: null, created_at: '2024-01-01' },
      ],
    });
    const user = userEvent.setup();
    
    window.confirm = vi.fn(() => false);
    
    render(<ClientsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    await user.click(deleteButton!);
    
    expect(apiClient.deleteClient).not.toHaveBeenCalled();
  });

  it('should close dialog when clicking Cancel', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    const user = userEvent.setup();
    
    render(<ClientsPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /add client/i }));
    expect(screen.getByText('Add New Client')).toBeInTheDocument();
    
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    
    await waitFor(() => {
      expect(screen.queryByText('Add New Client')).not.toBeInTheDocument();
    });
  });

  it('should show error on delete failure', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Test Client', description: null, created_at: '2024-01-01' },
      ],
    });
    vi.mocked(apiClient.deleteClient).mockRejectedValue({
      response: { data: { error: 'Delete failed' } },
    });
    const user = userEvent.setup();
    
    window.confirm = vi.fn(() => true);
    
    render(<ClientsPage />);
    
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
