import { createContext } from 'react';
import { type Theme } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  isDarkMode: boolean;
  theme: Theme;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
