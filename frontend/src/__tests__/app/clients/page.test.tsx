import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClientsPage from '@/app/clients/page';
import { AuthContext, AuthContextType } from '@/contexts/AuthContextValue';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '@/api/client';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/clients',
}));

jest.mock('@/api/client', () => ({
  getClients: jest.fn(),
  createClient: jest.fn(),
  updateClient: jest.fn(),
  deleteClient: jest.fn(),
  deleteAllClients: jest.fn(),
}));

jest.mock('@/components/AuthGuard', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

jest.mock('@/components/Layout', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
  };
});

describe('ClientsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    (apiClient.getClients as jest.Mock).mockResolvedValue({
      clients: [
        { id: 1, name: 'Client 1', description: 'Desc 1', department: 'Dept 1', email: 'client1@test.com', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, name: 'Client 2', description: null, department: null, email: null, created_at: '2024-01-02', updated_at: '2024-01-02' },
      ],
    });
  });

  const mockAuthContext: AuthContextType = {
    user: { email: 'test@example.com', createdAt: '2024-01-01' },
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    isAuthenticated: true,
  };

  const renderWithProviders = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={mockAuthContext}>
          <ClientsPage />
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  it('should show loading spinner while loading', () => {
    (apiClient.getClients as jest.Mock).mockImplementation(() => new Promise(() => {}));

    renderWithProviders();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should call getClients on mount', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(apiClient.getClients).toHaveBeenCalled();
    });
  });

  it('should render clients page title', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Clients')).toBeInTheDocument();
    });
  });

  it('should display Add Client button', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument();
    });
  });

  it('should display Clear All button when clients exist', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });
  });

  it('should display client data in table', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument();
      expect(screen.getByText('Client 2')).toBeInTheDocument();
      expect(screen.getByText('Desc 1')).toBeInTheDocument();
      expect(screen.getByText('Dept 1')).toBeInTheDocument();
      expect(screen.getByText('client1@test.com')).toBeInTheDocument();
    });
  });

  it('should open add client dialog when clicking Add Client', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Client'));

    await waitFor(() => {
      expect(screen.getByText('Add New Client')).toBeInTheDocument();
    });
  });

  it('should open edit client dialog when clicking edit button', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTestId('EditIcon');
    fireEvent.click(editButtons[0].closest('button')!);

    await waitFor(() => {
      expect(screen.getByText('Edit Client')).toBeInTheDocument();
    });
  });

  it('should create client when submitting form', async () => {
    const user = userEvent.setup();
    (apiClient.createClient as jest.Mock).mockResolvedValue({ client: { id: 3, name: 'New Client' } });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Client'));

    await waitFor(() => {
      expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/client name/i), 'New Client');
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(apiClient.createClient).toHaveBeenCalledWith({
        name: 'New Client',
        description: undefined,
        department: undefined,
        email: undefined,
      });
    });
  });

  it('should have required attribute on client name field', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Client'));

    await waitFor(() => {
      expect(screen.getByText('Add New Client')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/client name/i);
    expect(nameInput).toHaveAttribute('required');
  });

  it('should delete client when clicking delete button and confirming', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    (apiClient.deleteClient as jest.Mock).mockResolvedValue({ message: 'Deleted' });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0].closest('button')!);

    await waitFor(() => {
      expect(apiClient.deleteClient).toHaveBeenCalledWith(1);
    });
  });

  it('should not delete client when canceling confirmation', async () => {
    window.confirm = jest.fn().mockReturnValue(false);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0].closest('button')!);

    expect(apiClient.deleteClient).not.toHaveBeenCalled();
  });

  it('should delete all clients when clicking Clear All and confirming', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    (apiClient.deleteAllClients as jest.Mock).mockResolvedValue({ message: 'All deleted' });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Clear All'));

    await waitFor(() => {
      expect(apiClient.deleteAllClients).toHaveBeenCalled();
    });
  });

  it('should close dialog when clicking Cancel', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Client'));

    await waitFor(() => {
      expect(screen.getByText('Add New Client')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText('Add New Client')).not.toBeInTheDocument();
    });
  });

  it('should show empty state when no clients', async () => {
    (apiClient.getClients as jest.Mock).mockResolvedValue({ clients: [] });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/no clients found/i)).toBeInTheDocument();
    });
  });

  it('should update client when editing', async () => {
    const user = userEvent.setup();
    (apiClient.updateClient as jest.Mock).mockResolvedValue({ client: { id: 1, name: 'Updated Client' } });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTestId('EditIcon');
    fireEvent.click(editButtons[0].closest('button')!);

    await waitFor(() => {
      expect(screen.getByText('Edit Client')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/client name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Client');
    await user.click(screen.getByRole('button', { name: /update/i }));

    await waitFor(() => {
      expect(apiClient.updateClient).toHaveBeenCalledWith(1, {
        name: 'Updated Client',
        description: 'Desc 1',
        department: 'Dept 1',
        email: 'client1@test.com',
      });
    });
  });

  it('should handle create client error', async () => {
    const user = userEvent.setup();
    (apiClient.createClient as jest.Mock).mockRejectedValue({
      response: { data: { error: 'Failed to create' } },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Client'));

    await waitFor(() => {
      expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/client name/i), 'New Client');
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to create')).toBeInTheDocument();
    });
  });

  it('should handle delete client error', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    (apiClient.deleteClient as jest.Mock).mockRejectedValue({
      response: { data: { error: 'Failed to delete' } },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0].closest('button')!);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete')).toBeInTheDocument();
    });
  });
});
