import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../api/client', () => ({
  default: {
    getClients: vi.fn(),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
  },
}));

import React from 'react';
import ClientsPage from '../../pages/ClientsPage';
import apiClient from '../../api/client';

const mockedApiClient = vi.mocked(apiClient);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApiClient.getClients.mockResolvedValue({ clients: [] });
  });

  it('should render page title', async () => {
    render(<ClientsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    mockedApiClient.getClients.mockImplementation(() => new Promise(() => {}));
    
    render(<ClientsPage />, { wrapper: createWrapper() });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show empty state when no clients', async () => {
    render(<ClientsPage />, { wrapper: createWrapper() });

    await screen.findByText(/no clients found/i);
  });

  it('should display clients in table', async () => {
    mockedApiClient.getClients.mockResolvedValue({
      clients: [
        { id: 1, name: 'Client A', description: 'Description A', created_at: '2024-01-01' },
        { id: 2, name: 'Client B', description: null, created_at: '2024-01-02' },
      ],
    });

    render(<ClientsPage />, { wrapper: createWrapper() });

    await screen.findByText('Client A');
    expect(screen.getByText('Client B')).toBeInTheDocument();
    expect(screen.getByText('Description A')).toBeInTheDocument();
    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('should open add client dialog when Add Client button is clicked', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add client/i }));

    expect(screen.getByText('Add New Client')).toBeInTheDocument();
  });

  it('should open edit client dialog when edit button is clicked', async () => {
    const user = userEvent.setup();
    mockedApiClient.getClients.mockResolvedValue({
      clients: [
        { id: 1, name: 'Client A', description: 'Description A', created_at: '2024-01-01' },
      ],
    });

    render(<ClientsPage />, { wrapper: createWrapper() });

    await screen.findByText('Client A');

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('[data-testid="EditIcon"]'));
    if (editButton) {
      await user.click(editButton);
    }

    expect(screen.getByText('Edit Client')).toBeInTheDocument();
  });

  it('should create client when form is submitted', async () => {
    const user = userEvent.setup();
    mockedApiClient.createClient.mockResolvedValue({ client: { id: 1, name: 'New Client' } });

    render(<ClientsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add client/i }));
    
    const nameInput = screen.getByLabelText(/client name/i);
    await user.type(nameInput, 'New Client');

    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockedApiClient.createClient).toHaveBeenCalledWith({
        name: 'New Client',
        description: undefined,
      });
    });
  });

  it('should render form fields in add dialog', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add client/i }));

    expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should close dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<ClientsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add client/i }));
    expect(screen.getByText('Add New Client')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText('Add New Client')).not.toBeInTheDocument();
    });
  });

  it('should delete client when delete is confirmed', async () => {
    const user = userEvent.setup();
    mockedApiClient.getClients.mockResolvedValue({
      clients: [
        { id: 1, name: 'Client A', description: 'Description A', created_at: '2024-01-01' },
      ],
    });
    mockedApiClient.deleteClient.mockResolvedValue({ message: 'Deleted' });
    
    window.confirm = vi.fn().mockReturnValue(true);

    render(<ClientsPage />, { wrapper: createWrapper() });

    await screen.findByText('Client A');

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    if (deleteButton) {
      await user.click(deleteButton);
    }

    expect(window.confirm).toHaveBeenCalled();
    expect(mockedApiClient.deleteClient).toHaveBeenCalledWith(1);
  });

  it('should not delete client when delete is cancelled', async () => {
    const user = userEvent.setup();
    mockedApiClient.getClients.mockResolvedValue({
      clients: [
        { id: 1, name: 'Client A', description: 'Description A', created_at: '2024-01-01' },
      ],
    });
    
    window.confirm = vi.fn().mockReturnValue(false);

    render(<ClientsPage />, { wrapper: createWrapper() });

    await screen.findByText('Client A');

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    if (deleteButton) {
      await user.click(deleteButton);
    }

    expect(window.confirm).toHaveBeenCalled();
    expect(mockedApiClient.deleteClient).not.toHaveBeenCalled();
  });

  it('should show error on create failure', async () => {
    const user = userEvent.setup();
    mockedApiClient.createClient.mockRejectedValue({
      response: { data: { error: 'Creation failed' } },
    });

    render(<ClientsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add client/i }));
    
    const nameInput = screen.getByLabelText(/client name/i);
    await user.type(nameInput, 'New Client');

    await user.click(screen.getByRole('button', { name: /create/i }));

    await screen.findByText('Creation failed');
  });

  it('should update client when edit form is submitted', async () => {
    const user = userEvent.setup();
    mockedApiClient.getClients.mockResolvedValue({
      clients: [
        { id: 1, name: 'Client A', description: 'Description A', created_at: '2024-01-01' },
      ],
    });
    mockedApiClient.updateClient.mockResolvedValue({ client: { id: 1, name: 'Updated Client' } });

    render(<ClientsPage />, { wrapper: createWrapper() });

    await screen.findByText('Client A');

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('[data-testid="EditIcon"]'));
    if (editButton) {
      await user.click(editButton);
    }

    const nameInput = screen.getByLabelText(/client name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Client');

    await user.click(screen.getByRole('button', { name: /update/i }));

    await waitFor(() => {
      expect(mockedApiClient.updateClient).toHaveBeenCalledWith(1, {
        name: 'Updated Client',
        description: 'Description A',
      });
    });
  });
});
