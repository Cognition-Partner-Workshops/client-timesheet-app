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

const theme = createTheme({
  palette: {
    primary: {
      main: '#0D47A1',
      light: '#1565C0',
      dark: '#0A3D91',
    },
    secondary: {
      main: '#2E7D32',
      light: '#43A047',
      dark: '#1B5E20',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0D47A1',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0A3D91',
          color: '#FFFFFF',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(46, 125, 50, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.4)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#FFFFFF',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#2E7D32',
          '&:hover': {
            backgroundColor: '#1B5E20',
          },
        },
      },
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
