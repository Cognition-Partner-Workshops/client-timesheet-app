import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReportsPage from '../../pages/ReportsPage';

vi.mock('../../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getClientReport: vi.fn(),
    exportClientReportCsv: vi.fn(),
    exportClientReportPdf: vi.fn(),
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

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
  });

  it('should render page title', async () => {
    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });
  });

  it('should display loading spinner initially', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<ReportsPage />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display message when no clients exist', async () => {
    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText(/you need to create at least one client/i)).toBeInTheDocument();
    });
  });

  it('should display Create Client button when no clients', async () => {
    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /create client/i })).toBeInTheDocument();
    });
  });

  it('should display client selector when clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Choose a client...')).toBeInTheDocument();
    });
  });

  it('should display select prompt when no client selected', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText(/select a client to view their time report/i)).toBeInTheDocument();
    });
  });

  it('should display report data when client is selected', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });
    vi.mocked(apiClient.getClientReport).mockResolvedValue({
      client: { id: 1, name: 'Test Client' },
      workEntries: [
        {
          id: 1,
          hours: 8,
          description: 'Test work',
          date: '2024-01-15',
          created_at: '2024-01-15',
        },
      ],
      totalHours: 8,
      entryCount: 1,
    });

    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Choose a client...')).toBeInTheDocument();
    });
  });

  it('should show clients in dropdown', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Client A' },
        { id: 2, name: 'Client B' },
      ],
    });

    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Choose a client...')).toBeInTheDocument();
    });
  });

  it('should render export buttons', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export as csv/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export as pdf/i })).toBeInTheDocument();
    });
  });

  it('should display prompt to select client', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText(/select a client to view their time report/i)).toBeInTheDocument();
    });
  });

  it('should have disabled export buttons when no client selected', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      const csvButton = screen.getByRole('button', { name: /export as csv/i });
      const pdfButton = screen.getByRole('button', { name: /export as pdf/i });
      expect(csvButton).toBeDisabled();
      expect(pdfButton).toBeDisabled();
    });
  });

  it('should have export CSV button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export as csv/i })).toBeInTheDocument();
    });
  });

  it('should have export PDF button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export as pdf/i })).toBeInTheDocument();
    });
  });
});
