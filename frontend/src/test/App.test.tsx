import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import apiClient from '../api/client';

vi.mock('../api/client', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    getClients: vi.fn(),
    getWorkEntries: vi.fn(),
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render loading state initially', () => {
    vi.mocked(apiClient.getCurrentUser).mockImplementation(() => new Promise(() => {}));
    localStorage.setItem('userEmail', 'test@example.com');
    
    render(<App />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Time Tracker')).toBeInTheDocument();
    });
  });

  it('should call getCurrentUser when email is stored', async () => {
    localStorage.setItem('userEmail', 'test@example.com');
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue({
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
    });
    vi.mocked(apiClient.getClients).mockResolvedValue([]);
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(apiClient.getCurrentUser).toHaveBeenCalled();
    });
  });
});
