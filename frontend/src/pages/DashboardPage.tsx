import React, { useMemo } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

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

  const clients = useMemo(() => clientsData?.clients || [], [clientsData?.clients]);
  const workEntries = useMemo(() => workEntriesData?.workEntries || [], [workEntriesData?.workEntries]);

  const totalHours = useMemo(() => 
    workEntries.reduce((sum: number, entry: { hours: number }) => sum + entry.hours, 0),
    [workEntries]
  );
  const recentEntries = useMemo(() => workEntries.slice(0, 5), [workEntries]);

  const hoursPerClientData = useMemo(() => {
    const clientHoursMap: Record<string, number> = {};
    workEntries.forEach((entry: { client_name: string; hours: number }) => {
      const clientName = entry.client_name || 'Unknown';
      clientHoursMap[clientName] = (clientHoursMap[clientName] || 0) + entry.hours;
    });
    return Object.entries(clientHoursMap).map(([name, hours]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      hours: Number(hours.toFixed(2)),
    }));
  }, [workEntries]);

  const weeklyProgressData = useMemo(() => {
    const today = new Date();
    const last7Days: { date: string; hours: number; entries: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEntries = workEntries.filter((entry: { date: string }) => entry.date === dateStr);
      const dayHours = dayEntries.reduce((sum: number, entry: { hours: number }) => sum + entry.hours, 0);
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        hours: Number(dayHours.toFixed(2)),
        entries: dayEntries.length,
      });
    }
    
    return last7Days;
  }, [workEntries]);

  const statsCards = [
    {
      title: 'Total Clients',
      value: clients.length,
      icon: <BusinessIcon />,
      color: '#1976d2',
      action: () => navigate('/clients'),
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
      value: totalHours.toFixed(2),
      icon: <AssessmentIcon />,
      color: '#f57c00',
      action: () => navigate('/reports'),
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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* @ts-expect-error - MUI Grid item prop type issue */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Weekly Work Progress
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="hours"
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Hours Worked"
                    dot={{ fill: '#1976d2' }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="entries"
                    stroke="#388e3c"
                    strokeWidth={2}
                    name="Work Entries"
                    dot={{ fill: '#388e3c' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* @ts-expect-error - MUI Grid item prop type issue */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Hours by Client
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              {hoursPerClientData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hoursPerClientData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#f57c00" name="Hours" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Typography color="text.secondary">No client data yet. Add work entries to see hours by client.</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* @ts-expect-error - MUI Grid item prop type issue */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={3}>
              <Typography variant="h6">Recent Work Entries</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/work-entries')}
                sx={{ flexShrink: 0 }}
              >
                Add Entry
              </Button>
            </Box>
            {recentEntries.length > 0 ? (
              recentEntries.map((entry: { id: number; client_name: string; hours: number; date: string; description?: string }) => (
                <Box key={entry.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                  <Typography variant="subtitle1">{entry.client_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {entry.hours} hours - {new Date(entry.date).toLocaleDateString()}
                  </Typography>
                  {entry.description && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
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
