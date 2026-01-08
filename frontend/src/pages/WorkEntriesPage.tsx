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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import apiClient from '../api/client';
import { type WorkEntry } from '../types/api';
import { workEntriesStrings } from '../locales/workEntries';

const WorkEntriesPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const [formData, setFormData] = useState({
    clientId: 0,
    hours: '',
    description: '',
    date: new Date(),
  });
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const { data: workEntriesData, isLoading: entriesLoading } = useQuery({
    queryKey: ['workEntries'],
    queryFn: () => apiClient.getWorkEntries(),
  });

  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.getClients(),
  });

  const createMutation = useMutation({
    mutationFn: (entryData: { clientId: number; hours: number; description?: string; date: string }) =>
      apiClient.createWorkEntry(entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workEntries'] });
      handleClose();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || workEntriesStrings.createError);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { clientId?: number; hours?: number; description?: string; date?: string } }) =>
      apiClient.updateWorkEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workEntries'] });
      handleClose();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || workEntriesStrings.updateError);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteWorkEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workEntries'] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || workEntriesStrings.deleteError);
    },
  });

  const workEntries = workEntriesData?.workEntries || [];
  const clients = clientsData?.clients || [];

  const handleOpen = (entry?: WorkEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        clientId: entry.client_id,
        hours: entry.hours.toString(),
        description: entry.description || '',
        date: new Date(entry.date),
      });
    } else {
      setEditingEntry(null);
      setFormData({
        clientId: 0,
        hours: '',
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
      hours: '',
      description: '',
      date: new Date(),
    });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.clientId) {
      setError(workEntriesStrings.selectClientError);
      return;
    }

    const hours = parseFloat(formData.hours);
    if (!hours || hours <= 0 || hours > 24) {
      setError(workEntriesStrings.hoursRangeError);
      return;
    }

    if (!formData.date) {
      setError(workEntriesStrings.selectDateError);
      return;
    }

    const entryData = {
      clientId: formData.clientId,
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
    if (window.confirm(workEntriesStrings.deleteConfirmation(entry.hours, entry.client_name))) {
      deleteMutation.mutate(entry.id);
    }
  };

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
          <Typography variant="h4">{workEntriesStrings.pageTitle}</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            {workEntriesStrings.addWorkEntryButton}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {clients.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {workEntriesStrings.noClientsMessage}
            </Typography>
            <Button variant="contained" href="/clients">
              {workEntriesStrings.createClientButton}
            </Button>
          </Paper>
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{workEntriesStrings.tableHeaderClient}</TableCell>
                    <TableCell>{workEntriesStrings.tableHeaderDate}</TableCell>
                    <TableCell>{workEntriesStrings.tableHeaderHours}</TableCell>
                    <TableCell>{workEntriesStrings.tableHeaderDescription}</TableCell>
                    <TableCell align="right">{workEntriesStrings.tableHeaderActions}</TableCell>
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
                          <Typography variant="body2">
                            {new Date(entry.date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={workEntriesStrings.hoursLabel(entry.hours)} 
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
                            <Chip label={workEntriesStrings.noDescription} size="small" variant="outlined" />
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
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary" sx={{ py: 3 }}>
                          {workEntriesStrings.noWorkEntriesMessage}
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
            {editingEntry ? workEntriesStrings.editDialogTitle : workEntriesStrings.addDialogTitle}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <FormControl fullWidth margin="dense" required>
                <InputLabel>{workEntriesStrings.clientLabel}</InputLabel>
                <Select
                  label={workEntriesStrings.clientLabel}
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: Number(e.target.value) })}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {clients.map((client: { id: number; name: string }) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                margin="dense"
                label={workEntriesStrings.hoursFieldLabel}
                type="number"
                fullWidth
                required
                inputProps={{ min: 0.01, max: 24, step: 0.01 }}
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                disabled={createMutation.isPending || updateMutation.isPending}
              />

              <DatePicker
                label={workEntriesStrings.dateLabel}
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
                label={workEntriesStrings.descriptionLabel}
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
                {workEntriesStrings.cancelButton}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <CircularProgress size={24} />
                ) : (
                  editingEntry ? workEntriesStrings.updateButton : workEntriesStrings.createButton
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
