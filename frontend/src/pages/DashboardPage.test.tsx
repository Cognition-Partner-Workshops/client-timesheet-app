import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import DashboardPage from './DashboardPage';
import { render } from '../test/test-utils';

vi.mock('../api/client');

describe('DashboardPage', () => {
  it('should render dashboard title', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should display stats card titles', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Total Clients')).toBeInTheDocument();
    expect(screen.getByText('Total Work Entries')).toBeInTheDocument();
    expect(screen.getByText('Total Hours')).toBeInTheDocument();
  });

  it('should display quick actions section', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view reports/i })).toBeInTheDocument();
  });

  it('should display recent work entries section', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Recent Work Entries')).toBeInTheDocument();
  });
});
