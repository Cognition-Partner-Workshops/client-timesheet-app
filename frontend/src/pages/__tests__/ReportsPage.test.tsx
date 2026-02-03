import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/testUtils';
import ReportsPage from '../ReportsPage';
import apiClient from '../../api/client';

vi.mock('../../api/client');

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(apiClient.getClients).mockReturnValue(new Promise(() => {}));
    render(<ReportsPage />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render reports page title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });
  });

  it('should show message when no clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText(/you need to create at least one client/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /create client/i })).toBeInTheDocument();
  });

  it('should show client selector when clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1' }],
    });
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('should show prompt to select client when none selected', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1' }],
    });
    render(<ReportsPage />);

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
        { id: 1, hours: 5, date: '2024-01-01', description: 'Work done', created_at: '2024-01-01' },
        { id: 2, hours: 3, date: '2024-01-02', description: null, created_at: '2024-01-02' },
      ],
      totalHours: 8,
      entryCount: 2,
    });

    const user = userEvent.setup();
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Test Client' }));

    await waitFor(() => {
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
    });

    expect(screen.getByText('8.00')).toBeInTheDocument();
    expect(screen.getByText('Total Entries')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Average Hours per Entry')).toBeInTheDocument();
    expect(screen.getByText('4.00')).toBeInTheDocument();
  });

  it('should display work entries table in report', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });
    vi.mocked(apiClient.getClientReport).mockResolvedValue({
      client: { id: 1, name: 'Test Client' },
      workEntries: [
        { id: 1, hours: 5, date: '2024-01-01', description: 'Work done', created_at: '2024-01-01' },
      ],
      totalHours: 5,
      entryCount: 1,
    });

    const user = userEvent.setup();
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Test Client' }));

    await waitFor(() => {
      expect(screen.getByText('5 hours')).toBeInTheDocument();
    });

    expect(screen.getByText('Work done')).toBeInTheDocument();
  });

  it('should show empty entries message when no work entries', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });
    vi.mocked(apiClient.getClientReport).mockResolvedValue({
      client: { id: 1, name: 'Test Client' },
      workEntries: [],
      totalHours: 0,
      entryCount: 0,
    });

    const user = userEvent.setup();
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Test Client' }));

    await waitFor(() => {
      expect(screen.getByText(/no work entries found for this client/i)).toBeInTheDocument();
    });
  });

  it('should export CSV when clicking CSV button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });
    vi.mocked(apiClient.getClientReport).mockResolvedValue({
      client: { id: 1, name: 'Test Client' },
      workEntries: [{ id: 1, hours: 5, date: '2024-01-01', description: 'Work', created_at: '2024-01-01' }],
      totalHours: 5,
      entryCount: 1,
    });
    vi.mocked(apiClient.exportClientReportCsv).mockResolvedValue(new Blob(['csv data']));

    const createObjectURLMock = vi.fn().mockReturnValue('blob:test');
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    const user = userEvent.setup();
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Test Client' }));

    await waitFor(() => {
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
    });

    const csvButton = screen.getByRole('button', { name: /export as csv/i });
    await user.click(csvButton);

    await waitFor(() => {
      expect(apiClient.exportClientReportCsv).toHaveBeenCalledWith(1);
    });
  });

  it('should export PDF when clicking PDF button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });
    vi.mocked(apiClient.getClientReport).mockResolvedValue({
      client: { id: 1, name: 'Test Client' },
      workEntries: [{ id: 1, hours: 5, date: '2024-01-01', description: 'Work', created_at: '2024-01-01' }],
      totalHours: 5,
      entryCount: 1,
    });
    vi.mocked(apiClient.exportClientReportPdf).mockResolvedValue(new Blob(['pdf data']));

    const createObjectURLMock = vi.fn().mockReturnValue('blob:test');
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    const user = userEvent.setup();
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Test Client' }));

    await waitFor(() => {
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
    });

    const pdfButton = screen.getByRole('button', { name: /export as pdf/i });
    await user.click(pdfButton);

    await waitFor(() => {
      expect(apiClient.exportClientReportPdf).toHaveBeenCalledWith(1);
    });
  });

  it('should show error on CSV export failure', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });
    vi.mocked(apiClient.getClientReport).mockResolvedValue({
      client: { id: 1, name: 'Test Client' },
      workEntries: [{ id: 1, hours: 5, date: '2024-01-01', description: 'Work', created_at: '2024-01-01' }],
      totalHours: 5,
      entryCount: 1,
    });
    vi.mocked(apiClient.exportClientReportCsv).mockRejectedValue(new Error('Export failed'));

    const user = userEvent.setup();
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Test Client' }));

    await waitFor(() => {
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
    });

    const csvButton = screen.getByRole('button', { name: /export as csv/i });
    await user.click(csvButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to export CSV report')).toBeInTheDocument();
    });
  });

  it('should disable export buttons when no client selected', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const csvButton = screen.getByRole('button', { name: /export as csv/i });
    const pdfButton = screen.getByRole('button', { name: /export as pdf/i });

    expect(csvButton).toBeDisabled();
    expect(pdfButton).toBeDisabled();
  });
});
