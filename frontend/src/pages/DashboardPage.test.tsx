import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import DashboardPage from './DashboardPage';
import apiClient from '../api/client';

vi.mock('../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getWorkEntries: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the dashboard title', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

      render(<DashboardPage />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render all three stats cards', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

      render(<DashboardPage />);

      expect(screen.getByText('Total Clients')).toBeInTheDocument();
      expect(screen.getByText('Total Work Entries')).toBeInTheDocument();
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
    });

    it('should render Quick Actions section', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

      render(<DashboardPage />);

      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view reports/i })).toBeInTheDocument();
    });

    it('should render Recent Work Entries section', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

      render(<DashboardPage />);

      expect(screen.getByText('Recent Work Entries')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add entry/i })).toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    it('should display correct client count', async () => {
      const mockClients = [
        { id: 1, name: 'Client A', description: 'Desc A' },
        { id: 2, name: 'Client B', description: 'Desc B' },
        { id: 3, name: 'Client C', description: 'Desc C' },
      ];
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('should display correct work entries count', async () => {
      const mockWorkEntries = [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 5, date: '2024-01-01', description: 'Work 1' },
        { id: 2, client_id: 1, client_name: 'Client A', hours: 3, date: '2024-01-02', description: 'Work 2' },
      ];
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should display correct total hours', async () => {
      const mockWorkEntries = [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 5.5, date: '2024-01-01', description: 'Work 1' },
        { id: 2, client_id: 1, client_name: 'Client A', hours: 3.25, date: '2024-01-02', description: 'Work 2' },
      ];
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('8.75')).toBeInTheDocument();
      });
    });

    it('should display zero stats when no data exists', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

      render(<DashboardPage />);

      await waitFor(() => {
        const zeroElements = screen.getAllByText('0');
        expect(zeroElements.length).toBeGreaterThanOrEqual(2);
        expect(screen.getByText('0.00')).toBeInTheDocument();
      });
    });
  });

  describe('Recent Work Entries Display', () => {
    it('should display recent work entries', async () => {
      const mockWorkEntries = [
        { id: 1, client_id: 1, client_name: 'Acme Corp', hours: 5, date: '2024-01-15', description: 'Development work' },
        { id: 2, client_id: 2, client_name: 'Tech Inc', hours: 3, date: '2024-01-14', description: 'Meeting' },
      ];
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
        expect(screen.getByText('Tech Inc')).toBeInTheDocument();
        expect(screen.getByText('Development work')).toBeInTheDocument();
        expect(screen.getByText('Meeting')).toBeInTheDocument();
      });
    });

    it('should display hours and date for work entries', async () => {
      const mockWorkEntries = [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 8, date: '2024-01-15', description: 'Work' },
      ];
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/8 hours/i)).toBeInTheDocument();
      });
    });

    it('should display empty state when no work entries exist', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('No work entries yet')).toBeInTheDocument();
      });
    });

    it('should only display up to 5 recent entries', async () => {
      const mockWorkEntries = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        client_id: 1,
        client_name: `Client ${i + 1}`,
        hours: 1,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        description: `Entry ${i + 1}`,
      }));
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Client 1')).toBeInTheDocument();
        expect(screen.getByText('Client 5')).toBeInTheDocument();
        expect(screen.queryByText('Client 6')).not.toBeInTheDocument();
      });
    });

    it('should handle work entries without description', async () => {
      const mockWorkEntries = [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 4, date: '2024-01-15' },
      ];
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Client A')).toBeInTheDocument();
        expect(screen.getByText(/4 hours/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to clients page when clicking Total Clients card', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
      const user = userEvent.setup();

      render(<DashboardPage />);

      const clientsCard = screen.getByText('Total Clients').closest('[class*="MuiCard"]');
      expect(clientsCard).toBeInTheDocument();
      await user.click(clientsCard!);

      expect(mockNavigate).toHaveBeenCalledWith('/clients');
    });

    it('should navigate to work entries page when clicking Total Work Entries card', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
      const user = userEvent.setup();

      render(<DashboardPage />);

      const workEntriesCard = screen.getByText('Total Work Entries').closest('[class*="MuiCard"]');
      expect(workEntriesCard).toBeInTheDocument();
      await user.click(workEntriesCard!);

      expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
    });

    it('should navigate to reports page when clicking Total Hours card', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
      const user = userEvent.setup();

      render(<DashboardPage />);

      const hoursCard = screen.getByText('Total Hours').closest('[class*="MuiCard"]');
      expect(hoursCard).toBeInTheDocument();
      await user.click(hoursCard!);

      expect(mockNavigate).toHaveBeenCalledWith('/reports');
    });

    it('should navigate to clients page when clicking Add Client button', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
      const user = userEvent.setup();

      render(<DashboardPage />);

      const addClientButton = screen.getByRole('button', { name: /add client/i });
      await user.click(addClientButton);

      expect(mockNavigate).toHaveBeenCalledWith('/clients');
    });

    it('should navigate to work entries page when clicking Add Work Entry button', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
      const user = userEvent.setup();

      render(<DashboardPage />);

      const addWorkEntryButton = screen.getByRole('button', { name: /add work entry/i });
      await user.click(addWorkEntryButton);

      expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
    });

    it('should navigate to reports page when clicking View Reports button', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
      const user = userEvent.setup();

      render(<DashboardPage />);

      const viewReportsButton = screen.getByRole('button', { name: /view reports/i });
      await user.click(viewReportsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/reports');
    });

    it('should navigate to work entries page when clicking Add Entry button in Recent Work Entries', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
      const user = userEvent.setup();

      render(<DashboardPage />);

      const addEntryButton = screen.getByRole('button', { name: /add entry/i });
      await user.click(addEntryButton);

      expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
    });
  });

  describe('API Integration', () => {
    it('should call getClients API on mount', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(apiClient.getClients).toHaveBeenCalled();
      });
    });

    it('should call getWorkEntries API on mount', async () => {
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(apiClient.getWorkEntries).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(apiClient.getClients).mockRejectedValue(new Error('API Error'));
      vi.mocked(apiClient.getWorkEntries).mockRejectedValue(new Error('API Error'));

      render(<DashboardPage />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Total Clients')).toBeInTheDocument();
    });
  });

  describe('Data Calculations', () => {
    it('should correctly sum hours from multiple entries', async () => {
      const mockWorkEntries = [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 2.5, date: '2024-01-01' },
        { id: 2, client_id: 1, client_name: 'Client A', hours: 3.5, date: '2024-01-02' },
        { id: 3, client_id: 2, client_name: 'Client B', hours: 4, date: '2024-01-03' },
      ];
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('10.00')).toBeInTheDocument();
      });
    });

    it('should handle decimal hours correctly', async () => {
      const mockWorkEntries = [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 1.25, date: '2024-01-01' },
        { id: 2, client_id: 1, client_name: 'Client A', hours: 2.75, date: '2024-01-02' },
      ];
      vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
      vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('4.00')).toBeInTheDocument();
      });
    });
  });
});
