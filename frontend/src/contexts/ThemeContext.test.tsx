import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeContextProvider } from './ThemeContext';
import { useThemeContext } from '../hooks/useThemeContext';

const TestComponent = () => {
  const { mode, toggleTheme, isDarkMode } = useThemeContext();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="isDarkMode">{isDarkMode.toString()}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should provide default light mode', () => {
    render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(screen.getByTestId('isDarkMode')).toHaveTextContent('false');
  });

  it('should toggle theme from light to dark', () => {
    render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    
    fireEvent.click(screen.getByText('Toggle Theme'));
    
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('isDarkMode')).toHaveTextContent('true');
  });

  it('should toggle theme from dark to light', () => {
    localStorage.setItem('themeMode', 'dark');
    
    render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    
    fireEvent.click(screen.getByText('Toggle Theme'));
    
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(screen.getByTestId('isDarkMode')).toHaveTextContent('false');
  });

  it('should persist theme preference to localStorage', () => {
    render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );

    fireEvent.click(screen.getByText('Toggle Theme'));
    
    expect(localStorage.getItem('themeMode')).toBe('dark');
    
    fireEvent.click(screen.getByText('Toggle Theme'));
    
    expect(localStorage.getItem('themeMode')).toBe('light');
  });

  it('should load theme preference from localStorage', () => {
    localStorage.setItem('themeMode', 'dark');
    
    render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('isDarkMode')).toHaveTextContent('true');
  });

  it('should throw error when useThemeContext is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useThemeContext must be used within a ThemeContextProvider');
    
    consoleError.mockRestore();
  });
});

describe('Theme Colors', () => {
  it('should apply light theme colors correctly', () => {
    const ThemeColorTest = () => {
      const { theme } = useThemeContext();
      return (
        <div>
          <span data-testid="primary">{theme.palette.primary.main}</span>
          <span data-testid="background">{theme.palette.background.default}</span>
          <span data-testid="mode">{theme.palette.mode}</span>
        </div>
      );
    };

    render(
      <ThemeContextProvider>
        <ThemeColorTest />
      </ThemeContextProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(screen.getByTestId('background')).toHaveTextContent('#f5f5f5');
  });

  it('should apply dark theme colors correctly', () => {
    localStorage.setItem('themeMode', 'dark');
    
    const ThemeColorTest = () => {
      const { theme } = useThemeContext();
      return (
        <div>
          <span data-testid="primary">{theme.palette.primary.main}</span>
          <span data-testid="background">{theme.palette.background.default}</span>
          <span data-testid="mode">{theme.palette.mode}</span>
        </div>
      );
    };

    render(
      <ThemeContextProvider>
        <ThemeColorTest />
      </ThemeContextProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('background')).toHaveTextContent('#121212');
  });
});
