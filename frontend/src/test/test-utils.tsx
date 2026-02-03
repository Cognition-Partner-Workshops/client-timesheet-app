/* eslint-disable react-refresh/only-export-components */
import React, { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../contexts/AuthContextValue';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

interface AllProvidersProps {
  children: ReactNode;
  authValue?: AuthContextType;
}

const defaultAuthValue: AuthContextType = {
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  isAuthenticated: false,
};

const AllProviders: React.FC<AllProvidersProps> = ({ children, authValue = defaultAuthValue }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={authValue}>
          <BrowserRouter>{children}</BrowserRouter>
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: AuthContextType;
}

const customRender = (ui: ReactElement, options?: CustomRenderOptions) => {
  const { authValue, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: ({ children }) => <AllProviders authValue={authValue}>{children}</AllProviders>,
    ...renderOptions,
  });
};

export { customRender as render };
export { defaultAuthValue };
export { screen, waitFor, fireEvent, within } from '@testing-library/react';
