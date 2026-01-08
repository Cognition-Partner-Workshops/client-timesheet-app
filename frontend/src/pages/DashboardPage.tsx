import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  AttachMoney as BillableIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { type WorkEntry } from '../types/api';

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

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
  });

  const clients = clientsData?.clients || [];
  const workEntries: WorkEntry[] = workEntriesData?.workEntries || [];
  const projects = projectsData?.projects || [];

  const totalHours = workEntries.reduce((sum: number, entry: WorkEntry) => sum + entry.hours, 0);
  const billableHours = workEntries.filter((entry: WorkEntry) => entry.is_billable).reduce((sum: number, entry: WorkEntry) => sum + entry.hours, 0);
  const recentEntries = workEntries.slice(0, 5);

  // Calculate hours by client
  const hoursByClient = workEntries.reduce((acc: Record<string, number>, entry: WorkEntry) => {
    const clientName = entry.client_name || 'Unknown';
    acc[clientName] = (acc[clientName] || 0) + entry.hours;
    return acc;
  }, {});

  const maxClientHours = Math.max(...Object.values(hoursByClient), 1);

  // Calculate this week's hours
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekEntries = workEntries.filter((entry: WorkEntry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= startOfWeek;
  });
  const thisWeekHours = thisWeekEntries.reduce((sum: number, entry: WorkEntry) => sum + entry.hours, 0);

  const statsCards = [
    {
      title: 'Total Clients',
      value: clients.length,
      icon: <BusinessIcon />,
      color: '#1976d2',
      action: () => navigate('/clients'),
    },
    {
      title: 'Projects',
      value: projects.length,
      icon: <FolderIcon />,
      color: '#7b1fa2',
      action: () => navigate('/projects'),
    },
    {
      title: 'Total Work Entries',
      value: workEntries.length,
      icon: <AssignmentIcon />,
      color: '#388e3c',
      action: () => navigate('/work-entries'),
    },
    {
      title: 'Total Hours',
      value: totalHours.toFixed(1),
      icon: <AssessmentIcon />,
      color: '#f57c00',
      action: () => navigate('/reports'),
    },
    {
      title: 'Billable Hours',
      value: billableHours.toFixed(1),
      icon: <BillableIcon />,
      color: '#00897b',
      action: () => navigate('/work-entries'),
    },
    {
      title: 'This Week',
      value: thisWeekHours.toFixed(1),
      icon: <AssessmentIcon />,
      color: '#5c6bc0',
      action: () => navigate('/work-entries'),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          // @ts-expect-error - MUI Grid item prop type issue
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={stat.action}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={3}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: stat.color,
                      borderRadius: 1,
                      p: 1,
                      color: 'white',
                      flexShrink: 0,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* @ts-expect-error - MUI Grid item prop type issue */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" mb={2}>
              Hours by Client
            </Typography>
            {Object.keys(hoursByClient).length > 0 ? (
              Object.entries(hoursByClient)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([clientName, hours]) => (
                  <Box key={clientName} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2" fontWeight="medium">
                        {clientName}
                      </Typography>
                      <Chip label={`${hours.toFixed(1)} hrs`} size="small" color="primary" />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(hours / maxClientHours) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))
            ) : (
              <Typography color="text.secondary">No work entries yet</Typography>
            )}
          </Paper>
        </Grid>

        {/* @ts-expect-error - MUI Grid item prop type issue */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={3}>
              <Typography variant="h6">Recent Work Entries</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/work-entries')}
                sx={{ flexShrink: 0 }}
                size="small"
              >
                Add Entry
              </Button>
            </Box>
            {recentEntries.length > 0 ? (
              recentEntries.map((entry: WorkEntry) => (
                <Box key={entry.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle2">{entry.client_name}</Typography>
                      {entry.project_name && (
                        <Typography variant="caption" color="text.secondary">
                          {entry.project_name}
                        </Typography>
                      )}
                    </Box>
                    <Box display="flex" gap={0.5}>
                      <Chip label={`${entry.hours}h`} size="small" variant="outlined" />
                      {entry.is_billable && (
                        <Chip label="$" size="small" color="success" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(entry.date).toLocaleDateString()}
                  </Typography>
                  {entry.description && (
                    <Typography variant="body2" sx={{ mt: 0.5 }} noWrap>
                      {entry.description}
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">No work entries yet</Typography>
            )}
          </Paper>
        </Grid>

        {/* @ts-expect-error - MUI Grid item prop type issue */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/clients')}
                fullWidth
              >
                Add Client
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/projects')}
                fullWidth
                color="secondary"
              >
                Add Project
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/work-entries')}
                fullWidth
              >
                Add Work Entry
              </Button>
              <Button
                variant="outlined"
                startIcon={<AssessmentIcon />}
                onClick={() => navigate('/reports')}
                fullWidth
              >
                View Reports
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
