import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportsPage from '../ReportsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import apiClient from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getClientReport: vi.fn(),
    exportClientReportCsv: vi.fn(),
    exportClientReportPdf: vi.fn(),
  },
}));

const theme = createTheme();

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const renderReportsPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ReportsPage />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
  });

  it('should render page title', async () => {
    renderReportsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}));
    renderReportsPage();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show message when no clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    renderReportsPage();

    await screen.findByText(/you need to create at least one client/i);
  });

  it('should display client selector when clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Client A' },
        { id: 2, name: 'Client B' },
      ],
    });

    renderReportsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should show message to select a client', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });

    renderReportsPage();

    await screen.findByText(/select a client to view their time report/i);
  });

  it('should have export buttons disabled when no client selected', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });

    renderReportsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const csvButton = screen.getByRole('button', { name: /export as csv/i });
    const pdfButton = screen.getByRole('button', { name: /export as pdf/i });

    expect(csvButton).toBeDisabled();
    expect(pdfButton).toBeDisabled();
  });

  it('should display report when client is selected', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.getClientReport).mockResolvedValue({
      client: { id: 1, name: 'Client A' },
      workEntries: [
        { id: 1, hours: 8, date: '2024-01-01', description: 'Work done', created_at: '2024-01-01' },
      ],
      totalHours: 8,
      entryCount: 1,
    });

    renderReportsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    const option = await screen.findByRole('option', { name: 'Client A' });
    fireEvent.click(option);

    await screen.findByText('Total Hours');
  });

  it('should display average hours per entry', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.getClientReport).mockResolvedValue({
      client: { id: 1, name: 'Client A' },
      workEntries: [
        { id: 1, hours: 8, date: '2024-01-01', description: 'Work 1', created_at: '2024-01-01' },
        { id: 2, hours: 4, date: '2024-01-02', description: 'Work 2', created_at: '2024-01-02' },
      ],
      totalHours: 12,
      entryCount: 2,
    });

    renderReportsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    const option = await screen.findByRole('option', { name: 'Client A' });
    fireEvent.click(option);

    await screen.findByText('Average Hours per Entry');
    await screen.findByText('6.00');
  });

  it('should show empty state when client has no work entries', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.getClientReport).mockResolvedValue({
      client: { id: 1, name: 'Client A' },
      workEntries: [],
      totalHours: 0,
      entryCount: 0,
    });

    renderReportsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    const option = await screen.findByRole('option', { name: 'Client A' });
    fireEvent.click(option);

    await screen.findByText(/no work entries found for this client/i);
  });

  it('should export CSV when CSV button is clicked', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.getClientReport).mockResolvedValue({
      client: { id: 1, name: 'Client A' },
      workEntries: [],
      totalHours: 0,
      entryCount: 0,
    });
    const mockBlob = new Blob(['csv data'], { type: 'text/csv' });
    vi.mocked(apiClient.exportClientReportCsv).mockResolvedValue(mockBlob);

    const createObjectURLMock = vi.fn().mockReturnValue('blob:test');
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    renderReportsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    const option = await screen.findByRole('option', { name: 'Client A' });
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const csvButton = screen.getByRole('button', { name: /export as csv/i });
    await user.click(csvButton);

    await waitFor(() => {
      expect(apiClient.exportClientReportCsv).toHaveBeenCalledWith(1);
    });
  });

  it('should export PDF when PDF button is clicked', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.getClientReport).mockResolvedValue({
      client: { id: 1, name: 'Client A' },
      workEntries: [],
      totalHours: 0,
      entryCount: 0,
    });
    const mockBlob = new Blob(['pdf data'], { type: 'application/pdf' });
    vi.mocked(apiClient.exportClientReportPdf).mockResolvedValue(mockBlob);

    const createObjectURLMock = vi.fn().mockReturnValue('blob:test');
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    renderReportsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    const option = await screen.findByRole('option', { name: 'Client A' });
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const pdfButton = screen.getByRole('button', { name: /export as pdf/i });
    await user.click(pdfButton);

    await waitFor(() => {
      expect(apiClient.exportClientReportPdf).toHaveBeenCalledWith(1);
    });
  });

  it('should show error when CSV export fails', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.getClientReport).mockResolvedValue({
      client: { id: 1, name: 'Client A' },
      workEntries: [],
      totalHours: 0,
      entryCount: 0,
    });
    vi.mocked(apiClient.exportClientReportCsv).mockRejectedValue(new Error('Export failed'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderReportsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    const option = await screen.findByRole('option', { name: 'Client A' });
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const csvButton = screen.getByRole('button', { name: /export as csv/i });
    await user.click(csvButton);

    await screen.findByText('Failed to export CSV report');

    consoleError.mockRestore();
  });

  it('should show error when PDF export fails', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.getClientReport).mockResolvedValue({
      client: { id: 1, name: 'Client A' },
      workEntries: [],
      totalHours: 0,
      entryCount: 0,
    });
    vi.mocked(apiClient.exportClientReportPdf).mockRejectedValue(new Error('Export failed'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderReportsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    const option = await screen.findByRole('option', { name: 'Client A' });
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const pdfButton = screen.getByRole('button', { name: /export as pdf/i });
    await user.click(pdfButton);

    await screen.findByText('Failed to export PDF report');

    consoleError.mockRestore();
  });

  it('should display work entry with no description', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.getClientReport).mockResolvedValue({
      client: { id: 1, name: 'Client A' },
      workEntries: [
        { id: 1, hours: 8, date: '2024-01-01', description: null, created_at: '2024-01-01' },
      ],
      totalHours: 8,
      entryCount: 1,
    });

    renderReportsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    const option = await screen.findByRole('option', { name: 'Client A' });
    fireEvent.click(option);

    await screen.findByText('No description');
  });
});
