import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientsPage from '../../pages/ClientsPage';

vi.mock('../../api/client', () => ({
  default: {
    getClients: vi.fn(),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
  },
}));

import apiClient from '../../api/client';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
  });

  it('should render page title', async () => {
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument();
    });
  });

  it('should render Add Client button', async () => {
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });
  });

  it('should display loading spinner initially', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}));
    
    renderWithProviders(<ClientsPage />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display empty state when no clients', async () => {
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText(/no clients found/i)).toBeInTheDocument();
    });
  });

  it('should display clients in table', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Client A', description: 'Description A', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, name: 'Client B', description: null, created_at: '2024-01-02', updated_at: '2024-01-02' },
      ],
    });

    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeInTheDocument();
      expect(screen.getByText('Client B')).toBeInTheDocument();
      expect(screen.getByText('Description A')).toBeInTheDocument();
      expect(screen.getByText('No description')).toBeInTheDocument();
    });
  });

  it('should render table headers', async () => {
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('should open dialog when Add Client is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add client/i }));

    await waitFor(() => {
      expect(screen.getByText('Add New Client')).toBeInTheDocument();
      expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });
  });

  it('should open edit dialog when edit button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Test Client', description: 'Test Description', created_at: '2024-01-01', updated_at: '2024-01-01' },
      ],
    });

    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('[data-testid="EditIcon"]'));
    if (editButton) {
      await user.click(editButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Edit Client')).toBeInTheDocument();
    });
  });

  it('should close dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add client/i }));

    await waitFor(() => {
      expect(screen.getByText('Add New Client')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText('Add New Client')).not.toBeInTheDocument();
    });
  });

  it('should create client when form is submitted', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.createClient).mockResolvedValue({ client: { id: 1, name: 'New Client' } });

    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add client/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    });

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

  it('should require client name field', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add client/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/client name/i)).toBeRequired();
  });

  it('should call delete when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Test Client', description: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
      ],
    });
    vi.mocked(apiClient.deleteClient).mockResolvedValue({ message: 'Deleted' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    if (deleteButton) {
      await user.click(deleteButton);
    }

    await waitFor(() => {
      expect(apiClient.deleteClient).toHaveBeenCalledWith(1);
    });
  });

  it('should not delete when delete is cancelled', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Test Client', description: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
      ],
    });
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderWithProviders(<ClientsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    if (deleteButton) {
      await user.click(deleteButton);
    }

    expect(apiClient.deleteClient).not.toHaveBeenCalled();
  });
});
