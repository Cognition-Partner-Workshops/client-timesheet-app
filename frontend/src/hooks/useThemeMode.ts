import { useContext } from 'react';
import { ThemeContext, type ThemeContextType } from '../contexts/themeTypes';

export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};
