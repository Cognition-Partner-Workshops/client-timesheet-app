/* eslint-disable react-refresh/only-export-components */
import React, { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const theme = createTheme();

interface AuthContextType {
  user: { email: string; createdAt: string } | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const defaultAuthValue: AuthContextType = {
  user: { email: 'test@example.com', createdAt: '2024-01-01' },
  login: vi.fn(),
  logout: vi.fn(),
  isLoading: false,
  isAuthenticated: true,
};

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

interface AllTheProvidersProps {
  children: ReactNode;
  authValue?: AuthContextType;
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children, authValue = defaultAuthValue }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuthContext.Provider value={authValue}>
            <BrowserRouter>{children}</BrowserRouter>
          </AuthContext.Provider>
        </LocalizationProvider>
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
    wrapper: ({ children }) => (
      <AllTheProviders authValue={authValue}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };
export { defaultAuthValue };
