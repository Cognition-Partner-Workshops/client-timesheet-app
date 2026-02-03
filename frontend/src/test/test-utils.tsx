import React, { type ReactElement, type ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { AuthContext, type AuthContextType } from '../contexts/AuthContextValue'

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
})

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

interface WrapperProps {
  children: ReactNode
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: AuthContextType
  initialEntries?: string[]
  useMemoryRouter?: boolean
}

const defaultAuthValue: AuthContextType = {
  user: { email: 'test@example.com', createdAt: '2024-01-01' },
  login: async () => {},
  logout: () => {},
  isLoading: false,
  isAuthenticated: true,
}

export function createWrapper(options: CustomRenderOptions = {}) {
  const { authValue = defaultAuthValue, initialEntries = ['/'], useMemoryRouter = false } = options
  const queryClient = createTestQueryClient()

  return function Wrapper({ children }: WrapperProps) {
    const Router = useMemoryRouter ? MemoryRouter : BrowserRouter
    const routerProps = useMemoryRouter ? { initialEntries } : {}

    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <AuthContext.Provider value={authValue}>
              <Router {...routerProps}>{children}</Router>
            </AuthContext.Provider>
          </LocalizationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }
}

export function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  return render(ui, { wrapper: createWrapper(options), ...options })
}

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { customRender as render }
export { defaultAuthValue }
