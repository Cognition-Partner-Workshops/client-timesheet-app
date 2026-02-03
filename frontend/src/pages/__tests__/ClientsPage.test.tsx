import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/testUtils';
import ClientsPage from '../ClientsPage';
import apiClient from '../../api/client';

vi.mock('../../api/client');

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(apiClient.getClients).mockReturnValue(new Promise(() => {}));
    render(<ClientsPage />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render clients page title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    render(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument();
    });
  });

  it('should render Add Client button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    render(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });
  });

  it('should show empty state when no clients', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    render(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText(/no clients found/i)).toBeInTheDocument();
    });
  });

  it('should display clients in table', async () => {
    const mockClients = [
      { id: 1, name: 'Client A', description: 'Description A', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: 2, name: 'Client B', description: null, created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' },
    ];
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });

    render(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeInTheDocument();
    });

    expect(screen.getByText('Client B')).toBeInTheDocument();
    expect(screen.getByText('Description A')).toBeInTheDocument();
    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('should open dialog when clicking Add Client', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    const user = userEvent.setup();
    render(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add client/i }));

    expect(screen.getByText('Add New Client')).toBeInTheDocument();
    expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('should create client successfully', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.createClient).mockResolvedValue({ client: { id: 1, name: 'New Client' } });

    const user = userEvent.setup();
    render(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add client/i }));
    await user.type(screen.getByLabelText(/client name/i), 'New Client');
    await user.type(screen.getByLabelText(/description/i), 'New Description');
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(apiClient.createClient).toHaveBeenCalledWith({
        name: 'New Client',
        description: 'New Description',
      });
    });
  });

  it('should open edit dialog with client data', async () => {
    const mockClients = [
      { id: 1, name: 'Client A', description: 'Description A', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    ];
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });

    const user = userEvent.setup();
    render(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: '' });
    const editButton = editButtons.find(btn => btn.querySelector('[data-testid="EditIcon"]'));
    if (editButton) {
      await user.click(editButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Edit Client')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Client A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Description A')).toBeInTheDocument();
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

  it('should show error on create failure', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.createClient).mockRejectedValue({
      response: { data: { error: 'Client already exists' } },
    });

    const user = userEvent.setup();
    render(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add client/i }));
    await user.type(screen.getByLabelText(/client name/i), 'Existing Client');
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText('Client already exists')).toBeInTheDocument();
    });
  });

  it('should delete client after confirmation', async () => {
    const mockClients = [
      { id: 1, name: 'Client A', description: null, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    ];
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.deleteClient).mockResolvedValue({ message: 'Deleted' });

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    if (deleteButton) {
      await user.click(deleteButton);
    }

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(apiClient.deleteClient).toHaveBeenCalledWith(1);
    });

    confirmSpy.mockRestore();
  });

  it('should not delete client when confirmation is cancelled', async () => {
    const mockClients = [
      { id: 1, name: 'Client A', description: null, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    ];
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    render(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    if (deleteButton) {
      await user.click(deleteButton);
    }

    expect(confirmSpy).toHaveBeenCalled();
    expect(apiClient.deleteClient).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
