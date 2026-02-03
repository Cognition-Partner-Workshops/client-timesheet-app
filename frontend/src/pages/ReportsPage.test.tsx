import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ReportsPage from './ReportsPage';
import apiClient from '../api/client';

vi.mock('../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getClientReport: vi.fn(),
    exportClientReportCsv: vi.fn(),
    exportClientReportPdf: vi.fn(),
  },
}));

const mockClients = {
  clients: [
    { id: 1, name: 'Client A', description: 'Test client A', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 2, name: 'Client B', description: 'Test client B', created_at: '2024-01-02', updated_at: '2024-01-02' },
  ],
};

const mockReport = {
  client: { id: 1, name: 'Client A', description: 'Test client A', created_at: '2024-01-01', updated_at: '2024-01-01' },
  workEntries: [
    { id: 1, client_id: 1, hours: 8, description: 'Work entry 1', date: '2024-01-15', created_at: '2024-01-15', updated_at: '2024-01-15' },
    { id: 2, client_id: 1, hours: 4, description: 'Work entry 2', date: '2024-01-16', created_at: '2024-01-16', updated_at: '2024-01-16' },
  ],
  totalHours: 12,
  entryCount: 2,
};

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

const getClientSelect = () => screen.getByRole('combobox');

const selectClient = async (clientName: string) => {
  const select = getClientSelect();
  fireEvent.mouseDown(select);
  
  const listbox = await screen.findByRole('listbox');
  const option = within(listbox).getByText(clientName);
  fireEvent.click(option);
};

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.getClients).mockResolvedValue(mockClients);
    vi.mocked(apiClient.getClientReport).mockResolvedValue(mockReport);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}));
    renderWithProviders(<ReportsPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders reports page with client selector', async () => {
    renderWithProviders(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });
    expect(getClientSelect()).toBeInTheDocument();
  });

  it('shows message when no clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    renderWithProviders(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText(/You need to create at least one client/)).toBeInTheDocument();
    });
    expect(screen.getByText('Create Client')).toBeInTheDocument();
  });

  it('displays client options in dropdown', async () => {
    renderWithProviders(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });
    
    const select = getClientSelect();
    fireEvent.mouseDown(select);
    
    const listbox = await screen.findByRole('listbox');
    expect(within(listbox).getByText('Client A')).toBeInTheDocument();
    expect(within(listbox).getByText('Client B')).toBeInTheDocument();
  });

  it('shows prompt to select client when none selected', async () => {
    renderWithProviders(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Select a client to view their time report.')).toBeInTheDocument();
    });
  });

  it('displays report data when client is selected', async () => {
    renderWithProviders(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    await selectClient('Client A');

    await waitFor(() => {
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
    });
    
    expect(screen.getByText('12.00')).toBeInTheDocument();
    expect(screen.getByText('Total Entries')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays work entries in table', async () => {
    renderWithProviders(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    await selectClient('Client A');

    await waitFor(() => {
      expect(screen.getByText('Work entry 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Work entry 2')).toBeInTheDocument();
  });

  it('calculates average hours per entry correctly', async () => {
    renderWithProviders(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    await selectClient('Client A');

    await waitFor(() => {
      expect(screen.getByText('Average Hours per Entry')).toBeInTheDocument();
    });
    expect(screen.getByText('6.00')).toBeInTheDocument();
  });

  describe('CSV Export', () => {
    it('exports CSV successfully', async () => {
      const mockBlob = new Blob(['test,data'], { type: 'text/csv' });
      vi.mocked(apiClient.exportClientReportCsv).mockResolvedValue(mockBlob);

      renderWithProviders(<ReportsPage />);
      await waitFor(() => {
        expect(screen.getByText('Reports')).toBeInTheDocument();
      });

      await selectClient('Client A');

      await waitFor(() => {
        expect(screen.getByText('Total Hours')).toBeInTheDocument();
      });

      const csvButton = screen.getByLabelText('Export as CSV');
      fireEvent.click(csvButton);

      await waitFor(() => {
        expect(apiClient.exportClientReportCsv).toHaveBeenCalledWith(1);
      });
    });

    it('handles CSV export error and displays error message', async () => {
      vi.mocked(apiClient.exportClientReportCsv).mockRejectedValue(new Error('Export failed'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithProviders(<ReportsPage />);
      await waitFor(() => {
        expect(screen.getByText('Reports')).toBeInTheDocument();
      });

      await selectClient('Client A');

      await waitFor(() => {
        expect(screen.getByText('Total Hours')).toBeInTheDocument();
      });

      const csvButton = screen.getByLabelText('Export as CSV');
      fireEvent.click(csvButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to export CSV report')).toBeInTheDocument();
      });
    });

    it('does not export CSV when no client is selected', async () => {
      renderWithProviders(<ReportsPage />);
      await waitFor(() => {
        expect(screen.getByText('Reports')).toBeInTheDocument();
      });

      const csvButton = screen.getByLabelText('Export as CSV');
      expect(csvButton).toBeDisabled();
    });
  });

  describe('PDF Export', () => {
    it('exports PDF successfully', async () => {
      const mockBlob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
      vi.mocked(apiClient.exportClientReportPdf).mockResolvedValue(mockBlob);

      renderWithProviders(<ReportsPage />);
      await waitFor(() => {
        expect(screen.getByText('Reports')).toBeInTheDocument();
      });

      await selectClient('Client A');

      await waitFor(() => {
        expect(screen.getByText('Total Hours')).toBeInTheDocument();
      });

      const pdfButton = screen.getByLabelText('Export as PDF');
      fireEvent.click(pdfButton);

      await waitFor(() => {
        expect(apiClient.exportClientReportPdf).toHaveBeenCalledWith(1);
      });
    });

    it('handles PDF export error and displays error message', async () => {
      vi.mocked(apiClient.exportClientReportPdf).mockRejectedValue(new Error('Export failed'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithProviders(<ReportsPage />);
      await waitFor(() => {
        expect(screen.getByText('Reports')).toBeInTheDocument();
      });

      await selectClient('Client A');

      await waitFor(() => {
        expect(screen.getByText('Total Hours')).toBeInTheDocument();
      });

      const pdfButton = screen.getByLabelText('Export as PDF');
      fireEvent.click(pdfButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to export PDF report')).toBeInTheDocument();
      });
    });

    it('does not export PDF when no client is selected', async () => {
      renderWithProviders(<ReportsPage />);
      await waitFor(() => {
        expect(screen.getByText('Reports')).toBeInTheDocument();
      });

      const pdfButton = screen.getByLabelText('Export as PDF');
      expect(pdfButton).toBeDisabled();
    });
  });

  describe('Error Alert', () => {
    it('can dismiss error alert', async () => {
      vi.mocked(apiClient.exportClientReportCsv).mockRejectedValue(new Error('Export failed'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithProviders(<ReportsPage />);
      await waitFor(() => {
        expect(screen.getByText('Reports')).toBeInTheDocument();
      });

      await selectClient('Client A');

      await waitFor(() => {
        expect(screen.getByText('Total Hours')).toBeInTheDocument();
      });

      const csvButton = screen.getByLabelText('Export as CSV');
      fireEvent.click(csvButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to export CSV report')).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Failed to export CSV report')).not.toBeInTheDocument();
      });
    });
  });
});
