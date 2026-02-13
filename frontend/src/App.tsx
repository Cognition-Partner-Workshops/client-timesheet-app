/**
 * Root Application Component — Providers, Theme & Routing
 *
 * This is the top-level React component rendered by main.tsx. It composes
 * the full provider hierarchy and defines the client-side route table.
 *
 * Provider nesting order (outermost → innermost):
 *  1. QueryClientProvider  — React Query cache for server-state management.
 *  2. ThemeProvider        — MUI theme (primary/secondary palette colours).
 *  3. CssBaseline          — MUI's CSS reset for consistent cross-browser styles.
 *  4. AuthProvider         — Authentication context (user state, login/logout).
 *  5. BrowserRouter        — React Router v6 for client-side navigation.
 *
 * Routing strategy (see AppContent):
 *  - `/login` is always accessible.
 *  - All other paths (`/*`) are wrapped in an auth guard:
 *    • Authenticated → render inside `<Layout>` (AppBar + Drawer navigation).
 *    • Unauthenticated → redirect to `/login`.
 *  - Unknown paths redirect to `/dashboard`.
 *
 * Key configuration:
 *  - queryClient: retries failed queries once; disables refetch-on-focus to
 *    avoid unnecessary network requests when switching browser tabs.
 *  - theme: uses MUI's createTheme with a blue primary and red secondary.
 *
 * Related files:
 *  - main.tsx                      — mounts this component on #root
 *  - contexts/AuthContext.tsx       — AuthProvider consumed here
 *  - hooks/useAuth.ts              — convenience hook for AuthContext
 *  - components/Layout.tsx         — shell layout for authenticated pages
 *  - pages/*                       — individual page components
 *  - api/client.ts                 — API client used by pages via React Query
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import WorkEntriesPage from './pages/WorkEntriesPage';
import ReportsPage from './pages/ReportsPage';

// MUI theme — defines the colour palette used across all Material-UI components.
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

// React Query client — shared cache for all useQuery / useMutation hooks.
// retry: 1  → one automatic retry on network failure before surfacing the error.
// refetchOnWindowFocus: false → prevents refetches when the user switches tabs.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// AppContent is separated from App so it can call useAuth() inside the
// AuthProvider boundary. It owns the router and the auth-gated route tree.
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* All non-login paths are auth-gated: authenticated users see the
            Layout shell; everyone else is redirected to /login. */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/work-entries" element={<WorkEntriesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

// App assembles the provider stack. The nesting order matters:
// QueryClientProvider must wrap anything that uses useQuery/useMutation,
// ThemeProvider must wrap MUI components, and AuthProvider must wrap any
// component that calls useAuth().
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
