import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import apiClient from '../api/client';
import { type WorkEntry, type Project } from '../types/api';

function formatHoursToHM(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

function roundToNearest5Min(totalMinutes: number): number {
  return Math.round(totalMinutes / 5) * 5;
}

const MINUTE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const WorkEntriesPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const [formData, setFormData] = useState({
    clientId: 0,
    projectId: 0,
    hoursVal: 0,
    minutesVal: 0,
    description: '',
    date: new Date(),
  });
  const [error, setError] = useState('');

  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerClientId, setTimerClientId] = useState(0);
  const [timerProjectId, setTimerProjectId] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const queryClient = useQueryClient();

  const { data: workEntriesData, isLoading: entriesLoading } = useQuery({
    queryKey: ['workEntries'],
    queryFn: () => apiClient.getWorkEntries(),
  });

  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.getClients(),
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
  });

  const createMutation = useMutation({
    mutationFn: (entryData: { clientId: number; projectId?: number | null; hours: number; description?: string; date: string }) =>
      apiClient.createWorkEntry(entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workEntries'] });
      handleClose();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to create work entry');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { clientId?: number; projectId?: number | null; hours?: number; description?: string; date?: string } }) =>
      apiClient.updateWorkEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workEntries'] });
      handleClose();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to update work entry');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteWorkEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workEntries'] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to delete work entry');
    },
  });

  const workEntries = workEntriesData?.workEntries || [];
  const clients = clientsData?.clients || [];
  const allProjects: Project[] = projectsData?.projects || [];

  const getProjectsForClient = useCallback((clientId: number): Project[] => {
    return allProjects.filter((p: Project) => p.client_id === clientId);
  }, [allProjects]);

  const handleOpen = (entry?: WorkEntry) => {
    if (entry) {
      setEditingEntry(entry);
      const h = Math.floor(entry.hours);
      const m = roundToNearest5Min(Math.round((entry.hours - h) * 60));
      setFormData({
        clientId: entry.client_id,
        projectId: entry.project_id || 0,
        hoursVal: h,
        minutesVal: m,
        description: entry.description || '',
        date: new Date(entry.date),
      });
    } else {
      setEditingEntry(null);
      setFormData({
        clientId: 0,
        projectId: 0,
        hoursVal: 0,
        minutesVal: 0,
        description: '',
        date: new Date(),
      });
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingEntry(null);
    setFormData({
      clientId: 0,
      projectId: 0,
      hoursVal: 0,
      minutesVal: 0,
      description: '',
      date: new Date(),
    });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.clientId) {
      setError('Please select a client');
      return;
    }

    const totalHours = formData.hoursVal + formData.minutesVal / 60;
    if (totalHours <= 0 || totalHours > 24) {
      setError('Time must be between 5 minutes and 24 hours');
      return;
    }

    if (!formData.date) {
      setError('Please select a date');
      return;
    }

    const hours = parseFloat(totalHours.toFixed(2));

    const entryData: { clientId: number; projectId?: number | null; hours: number; description?: string; date: string } = {
      clientId: formData.clientId,
      projectId: formData.projectId || null,
      hours,
      description: formData.description || undefined,
      date: formData.date.toISOString().split('T')[0],
    };

    if (editingEntry) {
      updateMutation.mutate({
        id: editingEntry.id,
        data: entryData,
      });
    } else {
      createMutation.mutate(entryData);
    }
  };

  const handleDelete = (entry: WorkEntry) => {
    if (window.confirm(`Are you sure you want to delete this ${formatHoursToHM(entry.hours)} entry for ${entry.client_name}?`)) {
      deleteMutation.mutate(entry.id);
    }
  };

  const startTimer = () => {
    if (!timerClientId) {
      setError('Please select a client for the timer');
      return;
    }
    setError('');
    setTimerRunning(true);
    setTimerSeconds(0);
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerRunning(false);

    const totalMinutes = roundToNearest5Min(Math.floor(timerSeconds / 60));
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    setFormData({
      clientId: timerClientId,
      projectId: timerProjectId,
      hoursVal: h,
      minutesVal: m < 5 && h === 0 ? 5 : m,
      description: '',
      date: new Date(),
    });
    setOpen(true);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTimerDisplay = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerClientProjects = getProjectsForClient(timerClientId);
  const formClientProjects = getProjectsForClient(formData.clientId);

  if (entriesLoading || clientsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Work Entries</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Add Work Entry
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {clients.length > 0 && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <TimerIcon color={timerRunning ? 'error' : 'action'} />
              <Typography variant="subtitle1" fontWeight="bold">
                Timer
              </Typography>

              {!timerRunning ? (
                <>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Client</InputLabel>
                    <Select
                      value={timerClientId}
                      onChange={(e) => {
                        setTimerClientId(Number(e.target.value));
                        setTimerProjectId(0);
                      }}
                      label="Client"
                    >
                      <MenuItem value={0}>Select client...</MenuItem>
                      {clients.map((client: { id: number; name: string }) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {timerClientProjects.length > 0 && (
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel>Project</InputLabel>
                      <Select
                        value={timerProjectId}
                        onChange={(e) => setTimerProjectId(Number(e.target.value))}
                        label="Project"
                      >
                        <MenuItem value={0}>No project</MenuItem>
                        {timerClientProjects.map((proj: Project) => (
                          <MenuItem key={proj.id} value={proj.id}>
                            {proj.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PlayIcon />}
                    onClick={startTimer}
                    disabled={!timerClientId}
                  >
                    Start
                  </Button>
                </>
              ) : (
                <>
                  <Typography
                    variant="h5"
                    fontFamily="monospace"
                    sx={{ color: 'error.main', fontWeight: 'bold' }}
                  >
                    {formatTimerDisplay(timerSeconds)}
                  </Typography>
                  <Chip
                    label={clients.find((c: { id: number; name: string }) => c.id === timerClientId)?.name || ''}
                    color="primary"
                    size="small"
                  />
                  {timerProjectId > 0 && (
                    <Chip
                      label={allProjects.find((p: Project) => p.id === timerProjectId)?.name || ''}
                      color="secondary"
                      size="small"
                    />
                  )}
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<StopIcon />}
                    onClick={stopTimer}
                  >
                    Stop
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        )}

        {clients.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              You need to create at least one client before adding work entries.
            </Typography>
            <Button variant="contained" href="/clients">
              Create Client
            </Button>
          </Paper>
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workEntries.length > 0 ? (
                    workEntries.map((entry: WorkEntry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {entry.client_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {entry.project_name ? (
                            <Chip label={entry.project_name} size="small" color="secondary" variant="outlined" />
                          ) : (
                            <Chip label="-" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(entry.date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={formatHoursToHM(entry.hours)}
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
                        <TableCell align="right">
                          <IconButton
                            onClick={() => handleOpen(entry)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(entry)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" sx={{ py: 3 }}>
                          No work entries found. Add your first work entry to get started.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingEntry ? 'Edit Work Entry' : 'Add New Work Entry'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <FormControl fullWidth margin="dense" required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: Number(e.target.value), projectId: 0 })}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {clients.map((client: { id: number; name: string }) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formClientProjects.length > 0 && (
                <FormControl fullWidth margin="dense">
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: Number(e.target.value) })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <MenuItem value={0}>No project</MenuItem>
                    {formClientProjects.map((proj: Project) => (
                      <MenuItem key={proj.id} value={proj.id}>
                        {proj.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Time (5-minute intervals)
              </Typography>
              {/* @ts-expect-error - MUI Grid item prop type issue */}
              <Grid container spacing={2}>
                {/* @ts-expect-error - MUI Grid item prop type issue */}
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Hours</InputLabel>
                    <Select
                      value={formData.hoursVal}
                      onChange={(e) => setFormData({ ...formData, hoursVal: Number(e.target.value) })}
                      label="Hours"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {Array.from({ length: 25 }, (_, i) => (
                        <MenuItem key={i} value={i}>{i}h</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* @ts-expect-error - MUI Grid item prop type issue */}
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Minutes</InputLabel>
                    <Select
                      value={formData.minutesVal}
                      onChange={(e) => setFormData({ ...formData, minutesVal: Number(e.target.value) })}
                      label="Minutes"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {MINUTE_OPTIONS.map((m) => (
                        <MenuItem key={m} value={m}>{m.toString().padStart(2, '0')}m</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(date) => date && setFormData({ ...formData, date })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'dense',
                    required: true,
                    disabled: createMutation.isPending || updateMutation.isPending,
                  },
                }}
              />

              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={createMutation.isPending || updateMutation.isPending}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} disabled={createMutation.isPending || updateMutation.isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <CircularProgress size={24} />
                ) : (
                  editingEntry ? 'Update' : 'Create'
                )}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default WorkEntriesPage;
