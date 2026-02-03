import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkEntriesPage from '@/app/work-entries/page';
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
  usePathname: () => '/work-entries',
}));

jest.mock('@/api/client', () => ({
  getClients: jest.fn(),
  getWorkEntries: jest.fn(),
  createWorkEntry: jest.fn(),
  updateWorkEntry: jest.fn(),
  deleteWorkEntry: jest.fn(),
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

describe('WorkEntriesPage', () => {
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
        { id: 1, name: 'Client 1' },
        { id: 2, name: 'Client 2' },
      ],
    });
    (apiClient.getWorkEntries as jest.Mock).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client 1', hours: 8, date: '2024-01-01', description: 'Work done', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, client_id: 2, client_name: 'Client 2', hours: 4, date: '2024-01-02', description: null, created_at: '2024-01-02', updated_at: '2024-01-02' },
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
          <WorkEntriesPage />
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  it('should show loading spinner while loading', () => {
    (apiClient.getWorkEntries as jest.Mock).mockImplementation(() => new Promise(() => {}));

    renderWithProviders();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should call getWorkEntries on mount', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(apiClient.getWorkEntries).toHaveBeenCalled();
    });
  });

  it('should call getClients on mount', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(apiClient.getClients).toHaveBeenCalled();
    });
  });

  it('should render work entries page title', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Work Entries')).toBeInTheDocument();
    });
  });

  it('should display Add Work Entry button', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Add Work Entry')).toBeInTheDocument();
    });
  });

  it('should display work entry data in table', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument();
      expect(screen.getByText('Client 2')).toBeInTheDocument();
      expect(screen.getByText('8 hours')).toBeInTheDocument();
      expect(screen.getByText('4 hours')).toBeInTheDocument();
      expect(screen.getByText('Work done')).toBeInTheDocument();
    });
  });

  it('should open add work entry dialog when clicking Add Work Entry', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Add Work Entry')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Work Entry'));

    await waitFor(() => {
      expect(screen.getByText('Add New Work Entry')).toBeInTheDocument();
    });
  });

  it('should delete work entry when clicking delete button and confirming', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    (apiClient.deleteWorkEntry as jest.Mock).mockResolvedValue({ message: 'Deleted' });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0].closest('button')!);

    await waitFor(() => {
      expect(apiClient.deleteWorkEntry).toHaveBeenCalledWith(1);
    });
  });

  it('should not delete work entry when canceling confirmation', async () => {
    window.confirm = jest.fn().mockReturnValue(false);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0].closest('button')!);

    expect(apiClient.deleteWorkEntry).not.toHaveBeenCalled();
  });

  it('should close dialog when clicking Cancel', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Add Work Entry')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Work Entry'));

    await waitFor(() => {
      expect(screen.getByText('Add New Work Entry')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText('Add New Work Entry')).not.toBeInTheDocument();
    });
  });

  it('should show empty state when no work entries', async () => {
    (apiClient.getWorkEntries as jest.Mock).mockResolvedValue({ workEntries: [] });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/no work entries found/i)).toBeInTheDocument();
    });
  });

  it('should show message when no clients exist', async () => {
    (apiClient.getClients as jest.Mock).mockResolvedValue({ clients: [] });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/you need to create at least one client/i)).toBeInTheDocument();
    });
  });

  it('should handle delete work entry error', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    (apiClient.deleteWorkEntry as jest.Mock).mockRejectedValue({
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
