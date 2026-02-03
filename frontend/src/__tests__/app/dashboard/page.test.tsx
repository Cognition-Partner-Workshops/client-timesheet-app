import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';
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
  usePathname: () => '/dashboard',
}));

jest.mock('@/api/client', () => ({
  getClients: jest.fn(),
  getWorkEntries: jest.fn(),
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

describe('DashboardPage', () => {
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
        { id: 2, client_id: 2, client_name: 'Client 2', hours: 4, date: '2024-01-02', description: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
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
          <DashboardPage />
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  it('should call getClients on mount', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(apiClient.getClients).toHaveBeenCalled();
    });
  });

  it('should call getWorkEntries on mount', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(apiClient.getWorkEntries).toHaveBeenCalled();
    });
  });

  it('should render dashboard title', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('should display stats cards', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Total Clients')).toBeInTheDocument();
      expect(screen.getByText('Total Work Entries')).toBeInTheDocument();
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
    });
  });

  it('should display client count', async () => {
    renderWithProviders();

    await waitFor(() => {
      const counts = screen.getAllByText('2');
      expect(counts.length).toBeGreaterThan(0);
    });
  });

  it('should display total hours', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('12.00')).toBeInTheDocument();
    });
  });

  it('should display recent work entries section', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Recent Work Entries')).toBeInTheDocument();
    });
  });

  it('should display quick actions section', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });
  });

  it('should navigate to clients when clicking Add Client button', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Client'));
    expect(mockPush).toHaveBeenCalledWith('/clients');
  });

  it('should navigate to work-entries when clicking Add Work Entry button', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Add Work Entry')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Work Entry'));
    expect(mockPush).toHaveBeenCalledWith('/work-entries');
  });

  it('should navigate to reports when clicking View Reports button', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('View Reports')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View Reports'));
    expect(mockPush).toHaveBeenCalledWith('/reports');
  });

  it('should display work entry details', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument();
      expect(screen.getByText('Work done')).toBeInTheDocument();
    });
  });

  it('should handle empty work entries', async () => {
    (apiClient.getWorkEntries as jest.Mock).mockResolvedValue({ workEntries: [] });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
    });
  });
});
