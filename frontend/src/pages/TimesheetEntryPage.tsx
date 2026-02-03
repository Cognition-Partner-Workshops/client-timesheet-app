import React, { useState, useMemo } from 'react';
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
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Snackbar,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Save as SaveIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { type Client, type WorkEntry } from '../types/api';

interface WeekDay {
  date: Date;
  dateString: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
}

interface TimesheetEntry {
  clientId: number;
  clientName: string;
  hours: { [dateString: string]: string };
  descriptions: { [dateString: string]: string };
}

const getWeekDays = (startDate: Date): WeekDay[] => {
  const days: WeekDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    date.setHours(0, 0, 0, 0);

    days.push({
      date,
      dateString: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: date.getTime() === today.getTime(),
    });
  }
  return days;
};

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const TimesheetEntryPage: React.FC = () => {
  const [weekStart, setWeekStart] = useState<Date>(() => getStartOfWeek(new Date()));
  const [timesheetData, setTimesheetData] = useState<{ [key: string]: TimesheetEntry }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [savingCells, setSavingCells] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.getClients(),
  });

  const { data: workEntriesData, isLoading: entriesLoading } = useQuery({
    queryKey: ['workEntries', weekDays[0]?.dateString, weekDays[6]?.dateString],
    queryFn: () => apiClient.getWorkEntries(),
  });

  const clients: Client[] = clientsData?.clients || [];

  const existingEntriesMap = useMemo(() => {
    const workEntries: WorkEntry[] = workEntriesData?.workEntries || [];
    const map: { [key: string]: WorkEntry } = {};
    workEntries.forEach((entry) => {
      const key = `${entry.client_id}-${entry.date}`;
      map[key] = entry;
    });
    return map;
  }, [workEntriesData]);

  const createMutation = useMutation({
    mutationFn: (entryData: { clientId: number; hours: number; description?: string; date: string }) =>
      apiClient.createWorkEntry(entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workEntries'] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to create work entry');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { hours?: number; description?: string } }) =>
      apiClient.updateWorkEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workEntries'] });
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

  const getHoursValue = (clientId: number, dateString: string): string => {
    const localKey = `${clientId}-${dateString}`;
    if (timesheetData[localKey]?.hours[dateString] !== undefined) {
      return timesheetData[localKey].hours[dateString];
    }
    const existingEntry = existingEntriesMap[localKey];
    if (existingEntry) {
      return existingEntry.hours.toString();
    }
    return '';
  };

  const handleHoursChange = (clientId: number, clientName: string, dateString: string, value: string) => {
    const key = `${clientId}-${dateString}`;
    setTimesheetData((prev) => ({
      ...prev,
      [key]: {
        clientId,
        clientName,
        hours: { ...prev[key]?.hours, [dateString]: value },
        descriptions: prev[key]?.descriptions || {},
      },
    }));
  };

  const handleSaveCell = async (clientId: number, dateString: string) => {
    const key = `${clientId}-${dateString}`;
    const localEntry = timesheetData[key];
    const hoursValue = localEntry?.hours[dateString];
    const existingEntry = existingEntriesMap[key];

    if (hoursValue === undefined || hoursValue === '') {
      if (existingEntry) {
        setSavingCells((prev) => new Set(prev).add(key));
        try {
          await deleteMutation.mutateAsync(existingEntry.id);
          setTimesheetData((prev) => {
            const newData = { ...prev };
            delete newData[key];
            return newData;
          });
          setSuccessMessage('Entry deleted');
        } finally {
          setSavingCells((prev) => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
          });
        }
      }
      return;
    }

    const hours = parseFloat(hoursValue);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      setError('Hours must be between 0 and 24');
      return;
    }

    setSavingCells((prev) => new Set(prev).add(key));

    try {
      if (existingEntry) {
        await updateMutation.mutateAsync({
          id: existingEntry.id,
          data: { hours },
        });
        setSuccessMessage('Entry updated');
      } else {
        await createMutation.mutateAsync({
          clientId,
          hours,
          date: dateString,
        });
        setSuccessMessage('Entry created');
      }
      setTimesheetData((prev) => {
        const newData = { ...prev };
        delete newData[key];
        return newData;
      });
    } finally {
      setSavingCells((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const handlePreviousWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() - 7);
    setWeekStart(newStart);
    setTimesheetData({});
  };

  const handleNextWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + 7);
    setWeekStart(newStart);
    setTimesheetData({});
  };

  const handleToday = () => {
    setWeekStart(getStartOfWeek(new Date()));
    setTimesheetData({});
  };

  const calculateDailyTotal = (dateString: string): number => {
    let total = 0;
    clients.forEach((client) => {
      const hours = parseFloat(getHoursValue(client.id, dateString));
      if (!isNaN(hours)) {
        total += hours;
      }
    });
    return total;
  };

  const calculateClientTotal = (clientId: number): number => {
    let total = 0;
    weekDays.forEach((day) => {
      const hours = parseFloat(getHoursValue(clientId, day.dateString));
      if (!isNaN(hours)) {
        total += hours;
      }
    });
    return total;
  };

  const calculateWeekTotal = (): number => {
    let total = 0;
    weekDays.forEach((day) => {
      total += calculateDailyTotal(day.dateString);
    });
    return total;
  };

  const formatWeekRange = (): string => {
    const endDate = new Date(weekStart);
    endDate.setDate(weekStart.getDate() + 6);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${weekStart.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
  };

  if (clientsLoading || entriesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Timesheet Entry</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="Previous Week">
            <IconButton onClick={handlePreviousWeek}>
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<TodayIcon />}
            onClick={handleToday}
            size="small"
          >
            Today
          </Button>
          <Tooltip title="Next Week">
            <IconButton onClick={handleNextWeek}>
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Typography variant="h6" color="text.secondary" mb={3}>
        {formatWeekRange()}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {clients.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            You need to create at least one client before entering time.
          </Typography>
          <Button variant="contained" href="/clients">
            Create Client
          </Button>
        </Paper>
      ) : (
        <>
          <Paper sx={{ mb: 3 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Client</TableCell>
                    {weekDays.map((day) => (
                      <TableCell
                        key={day.dateString}
                        align="center"
                        sx={{
                          fontWeight: 'bold',
                          backgroundColor: day.isToday ? 'primary.light' : 'inherit',
                          color: day.isToday ? 'primary.contrastText' : 'inherit',
                          minWidth: 100,
                        }}
                      >
                        <Typography variant="caption" display="block">
                          {day.dayName}
                        </Typography>
                        <Typography variant="body2">{day.dayNumber}</Typography>
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 80 }}>
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {client.name}
                        </Typography>
                      </TableCell>
                      {weekDays.map((day) => {
                        const cellKey = `${client.id}-${day.dateString}`;
                        const isSaving = savingCells.has(cellKey);
                        return (
                          <TableCell
                            key={day.dateString}
                            align="center"
                            sx={{
                              backgroundColor: day.isToday ? 'action.hover' : 'inherit',
                              p: 0.5,
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <TextField
                                size="small"
                                type="number"
                                inputProps={{
                                  min: 0,
                                  max: 24,
                                  step: 0.25,
                                  style: { textAlign: 'center', padding: '8px' },
                                }}
                                value={getHoursValue(client.id, day.dateString)}
                                onChange={(e) =>
                                  handleHoursChange(client.id, client.name, day.dateString, e.target.value)
                                }
                                disabled={isSaving}
                                sx={{ width: 70 }}
                                placeholder="0"
                              />
                              <Tooltip title="Save">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleSaveCell(client.id, day.dateString)}
                                    disabled={isSaving}
                                    color="primary"
                                  >
                                    {isSaving ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        );
                      })}
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {calculateClientTotal(client.id).toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        Daily Total
                      </Typography>
                    </TableCell>
                    {weekDays.map((day) => (
                      <TableCell key={day.dateString} align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {calculateDailyTotal(day.dateString).toFixed(2)}
                        </Typography>
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {calculateWeekTotal().toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Week Summary
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {calculateWeekTotal().toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total hours this week
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Active Clients
                  </Typography>
                  <Typography variant="h3" color="secondary">
                    {clients.filter((c) => calculateClientTotal(c.id) > 0).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Clients with logged hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Daily Average
                  </Typography>
                  <Typography variant="h3" color="info.main">
                    {(calculateWeekTotal() / 7).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average hours per day
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Box>
  );
};

export default TimesheetEntryPage;
