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
      main: '#0A3D91',
      light: '#0D47A1',
      dark: '#062654',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1B5E20',
      light: '#2E7D32',
      dark: '#0D3D12',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#062654',
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
            backgroundColor: 'rgba(27, 94, 32, 0.4)',
            '&:hover': {
              backgroundColor: 'rgba(27, 94, 32, 0.5)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          },
          '&:focus-visible': {
            outline: '3px solid #FFFFFF',
            outlineOffset: '2px',
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
          fontWeight: 500,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '3px solid #0A3D91',
            outlineOffset: '2px',
          },
        },
        containedPrimary: {
          backgroundColor: '#1B5E20',
          color: '#FFFFFF',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#0D3D12',
          },
        },
        outlinedPrimary: {
          borderColor: '#0A3D91',
          color: '#0A3D91',
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(10, 61, 145, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:focus-within': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#0A3D91',
                borderWidth: '2px',
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: '#4A4A4A',
            '&.Mui-focused': {
              color: '#0A3D91',
            },
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#0A3D91',
          textDecorationColor: '#0A3D91',
          '&:focus-visible': {
            outline: '3px solid #0A3D91',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '3px solid #0A3D91',
            outlineOffset: '2px',
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
