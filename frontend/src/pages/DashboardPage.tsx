import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.getClients(),
  });

  const { data: workEntriesData } = useQuery({
    queryKey: ['workEntries'],
    queryFn: () => apiClient.getWorkEntries(),
  });

  const clients = clientsData?.clients || [];
  const workEntries = workEntriesData?.workEntries || [];

  const totalHours = workEntries.reduce((sum: number, entry: { hours: number }) => sum + entry.hours, 0);
  const recentEntries = workEntries.slice(0, 5);
  const avgHoursPerEntry = workEntries.length > 0 ? totalHours / workEntries.length : 0;

  const statsCards = [
    {
      title: 'Total Clients',
      value: clients.length,
      icon: <BusinessIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      action: () => navigate('/clients'),
    },
    {
      title: 'Work Entries',
      value: workEntries.length,
      icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      action: () => navigate('/work-entries'),
    },
    {
      title: 'Total Hours',
      value: totalHours.toFixed(1),
      icon: <AssessmentIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
      action: () => navigate('/reports'),
    },
    {
      title: 'Avg Hours/Entry',
      value: avgHoursPerEntry.toFixed(1),
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      action: () => navigate('/reports'),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's an overview of your time tracking.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        {statsCards.map((stat, index) => (
          <Card
            key={index}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              },
            }}
            onClick={stat.action}
          >
            <Box
              sx={{
                background: stat.gradient,
                p: 3,
                color: 'white',
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500 }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '2fr 1fr',
          },
          gap: 3,
        }}
      >
        <Paper
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <Box
            sx={{
              p: 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Recent Work Entries
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => navigate('/work-entries')}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' },
              }}
            >
              Add Entry
            </Button>
          </Box>
          {recentEntries.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Hours</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentEntries.map((entry: { id: number; client_name: string; hours: number; date: string; description?: string }) => (
                    <TableRow
                      key={entry.id}
                      sx={{
                        '&:hover': { backgroundColor: 'grey.50' },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {entry.client_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(entry.date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${entry.hours}h`}
                          size="small"
                          sx={{
                            backgroundColor: 'primary.light',
                            color: 'primary.dark',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {entry.description || 'No description'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No work entries yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/work-entries')}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Create your first entry
              </Button>
            </Box>
          )}
        </Paper>

        <Paper
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            height: 'fit-content',
          }}
        >
          <Box
            sx={{
              p: 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Quick Actions
            </Typography>
          </Box>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                startIcon={<BusinessIcon />}
                onClick={() => navigate('/clients')}
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  },
                }}
              >
                Add New Client
              </Button>
              <Button
                variant="contained"
                startIcon={<AssignmentIcon />}
                onClick={() => navigate('/work-entries')}
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 4px 15px rgba(17, 153, 142, 0.4)',
                  },
                }}
              >
                Log Work Entry
              </Button>
              <Button
                variant="outlined"
                startIcon={<AssessmentIcon />}
                onClick={() => navigate('/reports')}
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                View Reports
              </Button>
            </Box>
          </CardContent>
        </Paper>
      </Box>
    </Box>
  );
};

export default DashboardPage;
