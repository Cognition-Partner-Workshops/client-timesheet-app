import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientsPage from './ClientsPage';
import { mockClients } from '../test/mocks';

vi.mock('../api/client', () => ({
  default: {
    getClients: vi.fn(),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
  },
}));

import apiClient from '../api/client';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

describe('ClientsPage', () => {
  const renderClientsPage = () => {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClientsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render clients page title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });

    renderClientsPage();

    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}));

    renderClientsPage();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display clients in table', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });

    renderClientsPage();

    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeInTheDocument();
    });

    expect(screen.getByText('Client B')).toBeInTheDocument();
    expect(screen.getByText('Description A')).toBeInTheDocument();
  });

  it('should show no clients message when empty', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });

    renderClientsPage();

    await waitFor(() => {
      expect(screen.getByText(/no clients found/i)).toBeInTheDocument();
    });
  });

  it('should have add client button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });

    renderClientsPage();

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument();
    });
  });

  it('should open add client dialog when clicking add button', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });

    renderClientsPage();

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Client'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should display table headers', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });

    renderClientsPage();

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should show edit and delete buttons for each client', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [mockClients[0]] });

    renderClientsPage();

    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTestId('EditIcon');
    const deleteButtons = screen.getAllByTestId('DeleteIcon');

    expect(editButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('should create client when form is submitted', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.createClient).mockResolvedValue({ client: mockClients[0] });

    renderClientsPage();

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Client'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/client name/i);
    await user.type(nameInput, 'New Client');

    const createButton = screen.getByRole('button', { name: /create/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(apiClient.createClient).toHaveBeenCalled();
    });
  });

  it('should delete client when delete is confirmed', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [mockClients[0]] });
    vi.mocked(apiClient.deleteClient).mockResolvedValue({ message: 'Deleted' });

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderClientsPage();

    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('DeleteIcon').closest('button');
    await user.click(deleteButton!);

    await waitFor(() => {
      expect(apiClient.deleteClient).toHaveBeenCalledWith(1);
    });

    confirmSpy.mockRestore();
  });
});
