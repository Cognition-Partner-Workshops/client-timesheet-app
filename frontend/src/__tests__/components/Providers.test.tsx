import React from 'react';
import { render, screen } from '@testing-library/react';
import Providers from '@/components/Providers';

describe('Providers', () => {
  it('should render children', () => {
    render(
      <Providers>
        <div>Test Content</div>
      </Providers>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should provide theme context', () => {
    render(
      <Providers>
        <div data-testid="themed-content">Themed Content</div>
      </Providers>
    );
    expect(screen.getByTestId('themed-content')).toBeInTheDocument();
  });

  it('should provide query client context', () => {
    render(
      <Providers>
        <div>Query Client Content</div>
      </Providers>
    );
    expect(screen.getByText('Query Client Content')).toBeInTheDocument();
  });

  it('should provide auth context', () => {
    render(
      <Providers>
        <div>Auth Content</div>
      </Providers>
    );
    expect(screen.getByText('Auth Content')).toBeInTheDocument();
  });
});
