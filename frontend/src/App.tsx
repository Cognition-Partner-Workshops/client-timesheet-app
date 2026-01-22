/**
 * @fileoverview Root Application Component
 * 
 * This file defines the main App component that serves as the root of the
 * Employee Time Tracking React application. It sets up the core application
 * infrastructure including routing, state management, theming, and authentication.
 * 
 * Application Architecture:
 * - React Query for server state management (caching, refetching, loading states)
 * - Material UI for consistent component styling and theming
 * - React Router for client-side navigation
 * - Custom AuthContext for JWT-based authentication state
 * 
 * Component Hierarchy:
 * QueryClientProvider (React Query)
 *   └── ThemeProvider (Material UI)
 *       └── CssBaseline (CSS reset)
 *           └── AuthProvider (Authentication context)
 *               └── AppContent (Router and routes)
 * 
 * @requires react - React library
 * @requires react-router-dom - Client-side routing
 * @requires @tanstack/react-query - Server state management
 * @requires @mui/material - Material UI components
 * 
 * @see {@link ./contexts/AuthContext} for authentication logic
 * @see {@link ./api/client} for API communication
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import WorkEntriesPage from './pages/WorkEntriesPage';
import ReportsPage from './pages/ReportsPage';

/**
 * Material UI Theme Configuration
 * 
 * Defines the application's visual design system including:
 * - Primary color: Blue (#1976d2) - used for main actions and navigation
 * - Secondary color: Pink (#dc004e) - used for accents and highlights
 * 
 * The theme is applied globally via ThemeProvider and affects all MUI components.
 * @type {import('@mui/material/styles').Theme}
 */
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

/**
 * React Query Client Configuration
 * 
 * Configures the global query client with default options:
 * - retry: 1 - Retry failed queries once before showing error
 * - refetchOnWindowFocus: false - Don't refetch when user returns to tab
 * 
 * These defaults can be overridden on a per-query basis.
 * @type {QueryClient}
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Application Content Component
 * 
 * Handles routing logic based on authentication state. This component:
 * - Shows a loading indicator while checking authentication status
 * - Redirects unauthenticated users to the login page
 * - Renders protected routes within the Layout component for authenticated users
 * 
 * Route Structure:
 * - /login - Public login page
 * - /dashboard - Main dashboard with statistics and recent activity
 * - /clients - Client management interface
 * - /work-entries - Time tracking interface
 * - /reports - Report generation and export
 * - / or /* - Redirects to dashboard
 * 
 * @component
 * @returns {JSX.Element} Router with conditional routes based on auth state
 */
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
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

/**
 * Root Application Component
 * 
 * The top-level component that wraps the entire application with necessary providers:
 * 1. QueryClientProvider - Enables React Query for server state management
 * 2. ThemeProvider - Applies Material UI theme to all child components
 * 3. CssBaseline - Normalizes CSS across browsers (similar to normalize.css)
 * 4. AuthProvider - Provides authentication context (login, logout, user state)
 * 
 * This component should be rendered once at the application root.
 * 
 * @component
 * @returns {JSX.Element} The fully configured application with all providers
 */
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
