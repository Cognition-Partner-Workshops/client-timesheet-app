import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReportsPage from './ReportsPage';
import { mockClients, mockClientReport } from '../test/mocks';

vi.mock('../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getClientReport: vi.fn(),
    exportClientReportCsv: vi.fn(),
    exportClientReportPdf: vi.fn(),
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

describe('ReportsPage', () => {
  const renderReportsPage = () => {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ReportsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:test');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('should render reports page title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });

    renderReportsPage();

    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}));

    renderReportsPage();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show message when no clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });

    renderReportsPage();

    await waitFor(() => {
      expect(screen.getByText(/you need to create at least one client/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Create Client')).toBeInTheDocument();
  });

  it('should display client selector when clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });

    renderReportsPage();

    await waitFor(() => {
      const selectClientElements = screen.getAllByText('Select Client');
      expect(selectClientElements.length).toBeGreaterThan(0);
    });
  });

  it('should show prompt to select client initially', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });

    renderReportsPage();

    await waitFor(() => {
      expect(screen.getByText(/select a client to view their time report/i)).toBeInTheDocument();
    });
  });

  it('should load report when client is selected', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getClientReport).mockResolvedValue(mockClientReport);

    renderReportsPage();

    await waitFor(() => {
      const selectClientElements = screen.getAllByText('Select Client');
      expect(selectClientElements.length).toBeGreaterThan(0);
    });

    const select = screen.getByRole('combobox');
    await user.click(select);

    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Client A'));

    await waitFor(() => {
      expect(apiClient.getClientReport).toHaveBeenCalledWith(1);
    });
  });

  it('should display report statistics', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getClientReport).mockResolvedValue(mockClientReport);

    renderReportsPage();

    await waitFor(() => {
      const selectClientElements = screen.getAllByText('Select Client');
      expect(selectClientElements.length).toBeGreaterThan(0);
    });

    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByText('Client A'));

    await waitFor(() => {
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
    });

    const hoursElements = screen.getAllByText('12.00');
    expect(hoursElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Total Entries')).toBeInTheDocument();
    const entriesElements = screen.getAllByText('2');
    expect(entriesElements.length).toBeGreaterThan(0);
  });

  it('should have export buttons', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });

    renderReportsPage();

    await waitFor(() => {
      expect(screen.getByTestId('DescriptionIcon')).toBeInTheDocument();
    });

    expect(screen.getByTestId('PictureAsPdfIcon')).toBeInTheDocument();
  });

  it('should display work entries table', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getClientReport).mockResolvedValue(mockClientReport);

    renderReportsPage();

    await waitFor(() => {
      const selectClientElements = screen.getAllByText('Select Client');
      expect(selectClientElements.length).toBeGreaterThan(0);
    });

    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByText('Client A'));

    await waitFor(() => {
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});
