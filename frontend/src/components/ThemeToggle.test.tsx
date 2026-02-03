import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';
import { ThemeContextProvider } from '../contexts/ThemeContext';

const renderWithThemeProvider = (component: React.ReactNode) => {
  return render(
    <ThemeContextProvider>
      {component}
    </ThemeContextProvider>
  );
};

describe('ThemeToggle', () => {
  it('should render the toggle button', () => {
    renderWithThemeProvider(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it('should show sun icon in light mode', () => {
    localStorage.setItem('themeMode', 'light');
    renderWithThemeProvider(<ThemeToggle />);
    
    const sunIcon = screen.getByTestId('LightModeIcon');
    expect(sunIcon).toBeInTheDocument();
  });

  it('should show moon icon in dark mode', () => {
    localStorage.setItem('themeMode', 'dark');
    renderWithThemeProvider(<ThemeToggle />);
    
    const moonIcon = screen.getByTestId('DarkModeIcon');
    expect(moonIcon).toBeInTheDocument();
  });

  it('should toggle from light to dark mode when clicked', () => {
    localStorage.setItem('themeMode', 'light');
    renderWithThemeProvider(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);
    
    expect(localStorage.getItem('themeMode')).toBe('dark');
  });

  it('should toggle from dark to light mode when clicked', () => {
    localStorage.setItem('themeMode', 'dark');
    renderWithThemeProvider(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);
    
    expect(localStorage.getItem('themeMode')).toBe('light');
  });

  it('should have accessible tooltip', () => {
    renderWithThemeProvider(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toHaveAttribute('aria-label', 'Toggle theme');
  });
});
