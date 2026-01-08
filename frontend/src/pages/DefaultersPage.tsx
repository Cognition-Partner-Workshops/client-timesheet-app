import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  TextField,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { type WeeklyDefaultersReport } from '../types/api';

const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
};

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const DefaultersPage: React.FC = () => {
  const currentMonday = getMonday(new Date());
  const [weekStart, setWeekStart] = useState<string>(formatDateForInput(currentMonday));
  const [error, setError] = useState('');

  const { data: reportData, isLoading, isError } = useQuery({
    queryKey: ['weeklyDefaulters', weekStart],
    queryFn: () => apiClient.getWeeklyDefaulters(weekStart),
    enabled: !!weekStart,
  });

  const report = reportData as WeeklyDefaultersReport | undefined;

  const handleWeekChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(event.target.value);
    const monday = getMonday(selectedDate);
    setWeekStart(formatDateForInput(monday));
    setError('');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Weekly Timesheet Defaulters
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load defaulters report. Please try again.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          {/* @ts-expect-error - MUI Grid item prop type issue */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Select Week"
              type="date"
              value={weekStart}
              onChange={handleWeekChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Select any date to view defaulters for that week (Monday to Sunday)"
            />
          </Grid>
          {/* @ts-expect-error - MUI Grid item prop type issue */}
          <Grid item xs={12} md={6}>
            {report && (
              <Typography variant="body1" color="text.secondary">
                Showing defaulters for week: <strong>{report.weekStart}</strong> to <strong>{report.weekEnd}</strong>
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {report && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* @ts-expect-error - MUI Grid item prop type issue */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4" component="div">
                    {report.totalUsers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* @ts-expect-error - MUI Grid item prop type issue */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderLeft: '4px solid #4caf50' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Submitted
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {report.submittedCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* @ts-expect-error - MUI Grid item prop type issue */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderLeft: '4px solid #f44336' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Defaulters
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {report.defaulterCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* @ts-expect-error - MUI Grid item prop type issue */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Compliance Rate
                  </Typography>
                  <Typography variant="h4" component="div">
                    {report.totalUsers > 0
                      ? ((report.submittedCount / report.totalUsers) * 100).toFixed(1)
                      : 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>User Since</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.defaulters.length > 0 ? (
                    report.defaulters.map((defaulter) => (
                      <TableRow key={defaulter.email}>
                        <TableCell>
                          <Typography variant="body2">
                            {defaulter.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="No Submission"
                            color="error"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(defaulter.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography color="success.main" sx={{ py: 3 }}>
                          All users have submitted their timesheets for this week!
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default DefaultersPage;
