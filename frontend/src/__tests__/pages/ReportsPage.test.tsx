import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getClientReport: vi.fn(),
    exportClientReportCsv: vi.fn(),
    exportClientReportPdf: vi.fn(),
  },
}));

import React from 'react';
import ReportsPage from '../../pages/ReportsPage';
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

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApiClient.getClients.mockResolvedValue({ clients: [] });
  });

  it('should render page title', async () => {
    render(<ReportsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    mockedApiClient.getClients.mockImplementation(() => new Promise(() => {}));

    render(<ReportsPage />, { wrapper: createWrapper() });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show message when no clients exist', async () => {
    render(<ReportsPage />, { wrapper: createWrapper() });

    await screen.findByText(/you need to create at least one client/i);
  });

  it('should show client selector when clients exist', async () => {
    mockedApiClient.getClients.mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1' }],
    });

    render(<ReportsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should show prompt to select client', async () => {
    mockedApiClient.getClients.mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1' }],
    });

    render(<ReportsPage />, { wrapper: createWrapper() });

    await screen.findByText(/select a client to view their time report/i);
  });

  it('should render export icons', async () => {
    mockedApiClient.getClients.mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });

    render(<ReportsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('DescriptionIcon')).toBeInTheDocument();
    expect(screen.getByTestId('PictureAsPdfIcon')).toBeInTheDocument();
  });

  it('should show Create Client button when no clients', async () => {
    render(<ReportsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /create client/i })).toBeInTheDocument();
  });
});
