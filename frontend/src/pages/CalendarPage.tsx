import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Badge,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickersDay, type PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { format, isSameDay, parseISO } from 'date-fns';
import apiClient from '../api/client';
import { type WorkEntry, type Client } from '../types/api';

interface ServerDayProps extends PickersDayProps {
  highlightedDays?: Date[];
}

function ServerDay(props: ServerDayProps) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

  const dayAsDate = day as Date;
  const isHighlighted = highlightedDays.some((highlightedDay) =>
    isSameDay(dayAsDate, highlightedDay)
  );

  return (
    <Badge
      key={dayAsDate.toString()}
      overlap="circular"
      badgeContent={isHighlighted ? '●' : undefined}
      sx={{
        '& .MuiBadge-badge': {
          fontSize: '0.5rem',
          color: 'primary.main',
          backgroundColor: 'transparent',
          top: 8,
          right: 8,
        },
      }}
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
}

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: 0,
    hours: '',
    description: '',
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
      handleCloseDialog();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to create work entry');
    },
  });

  const workEntries: WorkEntry[] = useMemo(() => {
    return workEntriesData?.workEntries || [];
  }, [workEntriesData?.workEntries]);

  const clients: Client[] = useMemo(() => {
    return clientsData?.clients || [];
  }, [clientsData?.clients]);

  const parseEntryDate = (date: string | number): Date => {
    if (typeof date === 'number') {
      return new Date(date);
    }
    return parseISO(date);
  };

  const highlightedDays = useMemo(() => {
    return workEntries
      .filter((entry) => entry.date != null)
      .map((entry) => parseEntryDate(entry.date));
  }, [workEntries]);

  const entriesForSelectedDate = useMemo(() => {
    return workEntries.filter((entry) => {
      if (entry.date == null) return false;
      return isSameDay(parseEntryDate(entry.date), selectedDate);
    });
  }, [workEntries, selectedDate]);

  const totalHoursForSelectedDate = useMemo(() => {
    return entriesForSelectedDate.reduce((sum, entry) => sum + entry.hours, 0);
  }, [entriesForSelectedDate]);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      clientId: 0,
      hours: '',
      description: '',
    });
    setError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      clientId: 0,
      hours: '',
      description: '',
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

    const hours = parseFloat(formData.hours);
    if (!hours || hours <= 0 || hours > 24) {
      setError('Hours must be between 0 and 24');
      return;
    }

    const entryData = {
      clientId: formData.clientId,
      hours,
      description: formData.description || undefined,
      date: format(selectedDate, 'yyyy-MM-dd'),
    };

    createMutation.mutate(entryData);
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
          <Typography variant="h4">Calendar</Typography>
        </Box>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Paper sx={{ p: 2, flex: '0 0 auto' }}>
            <DateCalendar
              value={selectedDate}
              onChange={handleDateChange}
              slots={{
                day: ServerDay,
              }}
                            slotProps={{
                              day: {
                                highlightedDays,
                              } as Partial<ServerDayProps>,
                            }}
            />
          </Paper>

          <Paper sx={{ p: 3, flex: 1, minWidth: 0 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </Typography>
                {entriesForSelectedDate.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Total: {totalHoursForSelectedDate} hours
                  </Typography>
                )}
              </Box>
              {clients.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                  size="small"
                >
                  Add Entry
                </Button>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {clients.length === 0 ? (
              <Box textAlign="center" py={3}>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  You need to create at least one client before adding work entries.
                </Typography>
                <Button variant="contained" href="/clients">
                  Create Client
                </Button>
              </Box>
            ) : entriesForSelectedDate.length === 0 ? (
              <Box textAlign="center" py={3}>
                <Typography color="text.secondary">
                  No work entries for this date.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Click "Add Entry" to log your work.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {entriesForSelectedDate.map((entry, index) => (
                  <React.Fragment key={entry.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{
                        px: 0,
                        py: 1.5,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {entry.client_name}
                            </Typography>
                            <Chip
                              label={`${entry.hours} hrs`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={entry.description || 'No description'}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Box>

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Add Work Entry for {format(selectedDate, 'MMMM d, yyyy')}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <FormControl fullWidth margin="dense" required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: Number(e.target.value) })}
                  disabled={createMutation.isPending}
                  label="Client"
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                margin="dense"
                label="Hours"
                type="number"
                fullWidth
                required
                inputProps={{ min: 0.01, max: 24, step: 0.01 }}
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                disabled={createMutation.isPending}
              />

              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={createMutation.isPending}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} disabled={createMutation.isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? <CircularProgress size={24} /> : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default CalendarPage;
