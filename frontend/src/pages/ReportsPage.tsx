import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
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
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { type ClientReport, type ProjectReport } from '../types/api';

const ReportsPage: React.FC = () => {
  const [selectedClientId, setSelectedClientId] = useState<number>(0);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [error, setError] = useState('');

  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.getClients(),
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
  });

  const { data: clientReportData, isLoading: clientReportLoading } = useQuery({
    queryKey: ['clientReport', selectedClientId],
    queryFn: () => apiClient.getClientReport(selectedClientId),
    enabled: selectedClientId > 0,
  });

  const { data: projectReportData, isLoading: projectReportLoading } = useQuery({
    queryKey: ['projectReport', selectedProjectId],
    queryFn: () => apiClient.getProjectReport(selectedProjectId),
    enabled: selectedProjectId > 0,
  });

  const clients = clientsData?.clients || [];
  const projects = projectsData?.projects || [];

  const clientReport = clientReportData as ClientReport | undefined;
  const projectReport = projectReportData as ProjectReport | undefined;

  const handleExportCsv = async () => {
    if (!selectedClientId && !selectedProjectId) return;

    try {
      const blob = selectedClientId
        ? await apiClient.exportClientReportCsv(selectedClientId)
        : await apiClient.exportProjectReportCsv(selectedProjectId);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      if (selectedClientId) {
        const client = clients.find((c: { id: number; name: string }) => c.id === selectedClientId);
        a.download = `${client?.name?.replace(/[^a-zA-Z0-9]/g, '_')}_report_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        const project = projects.find((p: { id: number; name: string }) => p.id === selectedProjectId);
        a.download = `${project?.name?.replace(/[^a-zA-Z0-9]/g, '_')}_report_${new Date().toISOString().split('T')[0]}.csv`;
      }

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
    if (!selectedClientId && !selectedProjectId) return;

    try {
      const blob = selectedClientId
        ? await apiClient.exportClientReportPdf(selectedClientId)
        : await apiClient.exportProjectReportPdf(selectedProjectId);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      if (selectedClientId) {
        const client = clients.find((c: { id: number; name: string }) => c.id === selectedClientId);
        a.download = `${client?.name?.replace(/[^a-zA-Z0-9]/g, '_')}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      } else {
        const project = projects.find((p: { id: number; name: string }) => p.id === selectedProjectId);
        a.download = `${project?.name?.replace(/[^a-zA-Z0-9]/g, '_')}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      }

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      setError('Failed to export PDF report');
      console.error('Export error:', err);
    }
  };

  const selectedClient = clients.find((c: { id: number; name: string }) => c.id === selectedClientId);
  const selectedProject = projects.find((p: { id: number; name: string }) => p.id === selectedProjectId);

  const reportLoading = clientReportLoading || projectReportLoading;

  if (clientsLoading || projectsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {clients.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            You need to create at least one client before generating reports.
          </Typography>
          <Button variant="contained" href="/clients">
            Create Client
          </Button>
        </Paper>
      ) : projects.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Create at least one project to generate project reports.
          </Typography>
          <Button variant="contained" href="/projects">
            Create Project
          </Button>
        </Paper>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Select Client</InputLabel>
                  <Select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(Number(e.target.value));
                      setSelectedProjectId(0);
                    }}
                    label="Select Client"
                  >
                    <MenuItem value={0}>Choose a client...</MenuItem>
                    {clients.map((c: { id: number; name: string }) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" gap={2}>
                  <Tooltip title="Export as CSV">
                    <IconButton
                      onClick={handleExportCsv}
                      disabled={(!selectedClientId && !selectedProjectId) || reportLoading}
                      color="primary"
                      size="large"
                    >
                      <CsvIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export as PDF">
                    <IconButton
                      onClick={handleExportPdf}
                      disabled={(!selectedClientId && !selectedProjectId) || reportLoading}
                      color="error"
                      size="large"
                    >
                      <PdfIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Select Project</InputLabel>
                  <Select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(Number(e.target.value));
                      setSelectedClientId(0);
                    }}
                    label="Select Project"
                  >
                    <MenuItem value={0}>Choose a project...</MenuItem>
                    {projects.map((p: { id: number; name: string; client_name?: string }) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.client_name ? `${p.name} (${p.client_name})` : p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {(selectedClient || selectedProject) && reportLoading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          )}

          {selectedClient && clientReport && (
            <>
              <Typography variant="h5" gutterBottom>
                Client Report: {selectedClient.name}
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Hours
                      </Typography>
                      <Typography variant="h4" component="div">
                        {clientReport.totalHours.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Entries
                      </Typography>
                      <Typography variant="h4" component="div">
                        {clientReport.entryCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Average Hours per Entry
                      </Typography>
                      <Typography variant="h4" component="div">
                        {clientReport.entryCount > 0 ? (clientReport.totalHours / clientReport.entryCount).toFixed(2) : '0.00'}
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
                        <TableCell>Date</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>Project</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clientReport.workEntries.length > 0 ? (
                        clientReport.workEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(entry.date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${entry.hours} hours`}
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {entry.project_name ? (
                                <Typography variant="body2" color="text.secondary">
                                  {entry.project_name}
                                </Typography>
                              ) : (
                                <Chip label="-" size="small" variant="outlined" />
                              )}
                            </TableCell>
                            <TableCell>
                              {entry.description ? (
                                <Typography variant="body2" color="text.secondary">
                                  {entry.description}
                                </Typography>
                              ) : (
                                <Chip label="No description" size="small" variant="outlined" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(entry.created_at).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography color="text.secondary" sx={{ py: 3 }}>
                              No work entries found for this client.
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

          {selectedProject && projectReport && (
            <>
              <Typography variant="h5" gutterBottom>
                Project Report: {selectedProject.name}
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Hours
                      </Typography>
                      <Typography variant="h4" component="div">
                        {projectReport.totalHours.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Entries
                      </Typography>
                      <Typography variant="h4" component="div">
                        {projectReport.entryCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Average Hours per Entry
                      </Typography>
                      <Typography variant="h4" component="div">
                        {projectReport.entryCount > 0 ? (projectReport.totalHours / projectReport.entryCount).toFixed(2) : '0.00'}
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
                        <TableCell>Date</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projectReport.workEntries.length > 0 ? (
                        projectReport.workEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(entry.date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${entry.hours} hours`}
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {entry.description ? (
                                <Typography variant="body2" color="text.secondary">
                                  {entry.description}
                                </Typography>
                              ) : (
                                <Chip label="No description" size="small" variant="outlined" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(entry.created_at).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography color="text.secondary" sx={{ py: 3 }}>
                              No work entries found for this project.
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

          {!selectedClient && !selectedProject && (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Select a client or project to view their time report.
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default ReportsPage;
