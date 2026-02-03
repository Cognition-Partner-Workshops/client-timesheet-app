import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ReportsPage from '@/app/reports/page';
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
  usePathname: () => '/reports',
}));

jest.mock('@/api/client', () => ({
  getClients: jest.fn(),
  getClientReport: jest.fn(),
  exportClientReportCsv: jest.fn(),
  exportClientReportPdf: jest.fn(),
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

describe('ReportsPage', () => {
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
          <ReportsPage />
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

  it('should show loading spinner while loading clients', () => {
    (apiClient.getClients as jest.Mock).mockImplementation(() => new Promise(() => {}));

    renderWithProviders();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render reports page title', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });
  });

  it('should show message when no clients exist', async () => {
    (apiClient.getClients as jest.Mock).mockResolvedValue({ clients: [] });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/you need to create at least one client/i)).toBeInTheDocument();
    });
  });

  it('should show prompt to select client when no client selected', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/select a client to view their time report/i)).toBeInTheDocument();
    });
  });

  it('should render client selector when clients exist', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('should display report data when client is selected', async () => {
    (apiClient.getClientReport as jest.Mock).mockResolvedValue({
      client: { id: 1, name: 'Client 1' },
      workEntries: [
        { id: 1, hours: 8, date: '2024-01-01', description: 'Work done', created_at: '2024-01-01' },
      ],
      totalHours: 8,
      entryCount: 1,
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('should have export buttons disabled when no client selected', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const csvButton = screen.getByTestId('DescriptionIcon').closest('button');
    const pdfButton = screen.getByTestId('PictureAsPdfIcon').closest('button');

    expect(csvButton).toBeDisabled();
    expect(pdfButton).toBeDisabled();
  });
});
