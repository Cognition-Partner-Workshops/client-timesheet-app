import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

interface AnalyticsData {
  summary: {
    totalHours: number;
    totalEntries: number;
    totalClients: number;
    avgHoursPerEntry: number;
    avgHoursPerClient: number;
  };
  hoursByClient: Array<{ client: string; hours: number }>;
  dailyTrend: Array<{ date: string; hours: number }>;
  clientTrend: Array<Record<string, string | number>>;
  clients: string[];
}

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0288d1', '#689f38', '#ffa000'];

const AnalyticsPage: React.FC = () => {
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: () => apiClient.getAnalytics(),
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box>
        <Typography color="error">Failed to load analytics data</Typography>
      </Box>
    );
  }

  const { summary, hoursByClient, dailyTrend, clientTrend, clients } = data;

  const statsCards = [
    {
      title: 'Total Hours',
      value: summary.totalHours.toFixed(2),
      icon: <AccessTimeIcon />,
      color: '#1976d2',
    },
    {
      title: 'Total Entries',
      value: summary.totalEntries,
      icon: <AssignmentIcon />,
      color: '#388e3c',
    },
    {
      title: 'Total Clients',
      value: summary.totalClients,
      icon: <BusinessIcon />,
      color: '#f57c00',
    },
    {
      title: 'Avg Hours/Entry',
      value: summary.avgHoursPerEntry.toFixed(2),
      icon: <TrendingUpIcon />,
      color: '#7b1fa2',
    },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Analyze work entry trends across clients and time periods
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          // @ts-expect-error - MUI Grid item prop type issue
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" component="div">
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
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hours by Client
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hoursByClient} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="client" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#1976d2" name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* @ts-expect-error - MUI Grid item prop type issue */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Daily Hours Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip labelFormatter={(label) => `Date: ${label}`} />
                <Line type="monotone" dataKey="hours" stroke="#388e3c" strokeWidth={2} dot={{ r: 4 }} name="Hours" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* @ts-expect-error - MUI Grid item prop type issue */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Client Work Entries Trend Over Time
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Stacked area chart showing hours distribution across clients by date
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={clientTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip labelFormatter={(label) => `Date: ${label}`} />
                <Legend />
                {clients.map((client, index) => (
                  <Area
                    key={client}
                    type="monotone"
                    dataKey={client}
                    stackId="1"
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
