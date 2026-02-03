import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import ReportsPage from './ReportsPage';
import { render } from '../test/test-utils';
import apiClient from '../api/client';

vi.mock('../api/client');

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    
    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });
  });

  it('should show loading spinner initially', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}));
    
    render(<ReportsPage />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show message when no clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    
    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/you need to create at least one client/i)).toBeInTheDocument();
    });
  });

  it('should show prompt to select client when none selected', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });
    
    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/select a client to view their time report/i)).toBeInTheDocument();
    });
  });
});
