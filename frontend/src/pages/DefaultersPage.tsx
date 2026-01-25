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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Description as CsvIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { type DefaultersReport, type Defaulter } from '../types/api';

const DefaultersPage: React.FC = () => {
  const [daysThreshold, setDaysThreshold] = useState<number>(7);
  const [error, setError] = useState('');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['defaultersReport', daysThreshold],
    queryFn: () => apiClient.getDefaultersReport(daysThreshold),
  });

  const report = reportData as DefaultersReport | undefined;

  const handleExportCsv = async () => {
    try {
      const blob = await apiClient.exportDefaultersReportCsv(daysThreshold);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `defaulters_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      setError('Failed to export CSV report');
      console.error('Export error:', err);
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob = await apiClient.exportDefaultersReportPdf(daysThreshold);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `defaulters_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      setError('Failed to export PDF report');
      console.error('Export error:', err);
    }
  };

  const getStatusChip = (defaulter: Defaulter) => {
    if (defaulter.status === 'critical') {
      return (
        <Chip
          icon={<ErrorIcon />}
          label="Critical"
          color="error"
          size="small"
        />
      );
    }
    if (defaulter.status === 'warning') {
      return (
        <Chip
          icon={<WarningIcon />}
          label="Warning"
          color="warning"
          size="small"
        />
      );
    }
    return <Chip label="OK" color="success" size="small" />;
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
        Defaulters Report
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Days Threshold</InputLabel>
              <Select
                value={daysThreshold}
                onChange={(e) => setDaysThreshold(Number(e.target.value))}
                label="Days Threshold"
              >
                <MenuItem value={3}>3 days</MenuItem>
                <MenuItem value={7}>7 days</MenuItem>
                <MenuItem value={14}>14 days</MenuItem>
                <MenuItem value={30}>30 days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" gap={2}>
              <Tooltip title="Export as CSV">
                <IconButton
                  onClick={handleExportCsv}
                  disabled={!report || report.defaulters.length === 0}
                  color="primary"
                  size="large"
                >
                  <CsvIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export as PDF">
                <IconButton
                  onClick={handleExportPdf}
                  disabled={!report || report.defaulters.length === 0}
                  color="error"
                  size="large"
                >
                  <PdfIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {report && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Clients
                  </Typography>
                  <Typography variant="h4" component="div">
                    {report.summary.totalClients}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Defaulters
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {report.summary.defaultersCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Critical
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {report.summary.criticalCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Warning
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {report.summary.warningCount}
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
                    <TableCell>Client Name</TableCell>
                    <TableCell>Last Entry Date</TableCell>
                    <TableCell>Days Since Last Entry</TableCell>
                    <TableCell>Total Hours</TableCell>
                    <TableCell>Entry Count</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.defaulters.length > 0 ? (
                    report.defaulters.map((defaulter) => (
                      <TableRow key={defaulter.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {defaulter.name}
                          </Typography>
                          {defaulter.description && (
                            <Typography variant="caption" color="text.secondary">
                              {defaulter.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(defaulter.lastEntryDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${defaulter.daysSinceLastEntry} days`}
                            color={defaulter.status === 'critical' ? 'error' : 'warning'}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {defaulter.totalHours.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {defaulter.entryCount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(defaulter)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" sx={{ py: 3 }}>
                          No defaulters found. All clients have recent time entries.
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
