import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { LightMode as LightModeIcon, DarkMode as DarkModeIcon } from '@mui/icons-material';
import { useThemeContext } from '../hooks/useThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label="Toggle theme"
      >
        {isDarkMode ? <DarkModeIcon data-testid="DarkModeIcon" /> : <LightModeIcon data-testid="LightModeIcon" />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
