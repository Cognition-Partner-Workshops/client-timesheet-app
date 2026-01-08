import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTimer } from '../contexts/TimerContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Timer: React.FC = () => {
  const { activeTimer, elapsedTime, isLoading, startTimer, stopTimer, discardTimer } = useTimer();
  const queryClient = useQueryClient();
  
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number>(0);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [createWorkEntry, setCreateWorkEntry] = useState(true);
  const [isBillable, setIsBillable] = useState(true);

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.getClients(),
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects', selectedClientId],
    queryFn: () => apiClient.getProjectsByClient(selectedClientId),
    enabled: selectedClientId > 0,
  });

  const clients = clientsData?.clients || [];
  const projects = projectsData?.projects || [];

  const handleStartClick = () => {
    setSelectedClientId(0);
    setSelectedProjectId(0);
    setDescription('');
    setStartDialogOpen(true);
  };

  const handleStartTimer = async () => {
    try {
      await startTimer({
        clientId: selectedClientId || undefined,
        projectId: selectedProjectId || undefined,
        description: description || undefined,
      });
      setStartDialogOpen(false);
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  };

  const handleStopClick = () => {
    setSelectedClientId(activeTimer?.client_id || 0);
    setSelectedProjectId(activeTimer?.project_id || 0);
    setDescription(activeTimer?.description || '');
    setCreateWorkEntry(true);
    setIsBillable(true);
    setStopDialogOpen(true);
  };

  const handleStopTimer = async () => {
    try {
      await stopTimer({
        createWorkEntry,
        clientId: selectedClientId || undefined,
        projectId: selectedProjectId || undefined,
        description: description || undefined,
        isBillable,
      });
      setStopDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['workEntries'] });
    } catch (error) {
      console.error('Failed to stop timer:', error);
    }
  };

  const handleDiscardTimer = async () => {
    if (window.confirm('Are you sure you want to discard this timer? No work entry will be created.')) {
      try {
        await discardTimer();
      } catch (error) {
        console.error('Failed to discard timer:', error);
      }
    }
  };

  if (isLoading && !activeTimer) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} color="inherit" />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {activeTimer ? (
          <>
            <Chip
              label={formatTime(elapsedTime)}
              color="error"
              sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
            />
            {activeTimer.client_name && (
              <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
                {activeTimer.client_name}
                {activeTimer.project_name && ` / ${activeTimer.project_name}`}
              </Typography>
            )}
            <IconButton color="inherit" onClick={handleStopClick} size="small">
              <StopIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handleDiscardTimer} size="small">
              <DeleteIcon />
            </IconButton>
          </>
        ) : (
          <Button
            color="inherit"
            startIcon={<PlayIcon />}
            onClick={handleStartClick}
            size="small"
          >
            Start Timer
          </Button>
        )}
      </Box>

      <Dialog open={startDialogOpen} onClose={() => setStartDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start Timer</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Client (Optional)</InputLabel>
            <Select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(Number(e.target.value));
                setSelectedProjectId(0);
              }}
              label="Client (Optional)"
            >
              <MenuItem value={0}>No client selected</MenuItem>
              {clients.map((client: { id: number; name: string }) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedClientId > 0 && (
            <FormControl fullWidth margin="dense">
              <InputLabel>Project (Optional)</InputLabel>
              <Select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                label="Project (Optional)"
              >
                <MenuItem value={0}>No project selected</MenuItem>
                {projects.map((project: { id: number; name: string }) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStartTimer} variant="contained" startIcon={<PlayIcon />}>
            Start
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={stopDialogOpen} onClose={() => setStopDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Stop Timer</DialogTitle>
        <DialogContent>
          <Typography variant="h4" align="center" sx={{ my: 2, fontFamily: 'monospace' }}>
            {formatTime(elapsedTime)}
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={createWorkEntry}
                onChange={(e) => setCreateWorkEntry(e.target.checked)}
              />
            }
            label="Create work entry"
          />

          {createWorkEntry && (
            <>
              <FormControl fullWidth margin="dense" required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(Number(e.target.value));
                    setSelectedProjectId(0);
                  }}
                  label="Client"
                >
                  <MenuItem value={0}>Select a client</MenuItem>
                  {clients.map((client: { id: number; name: string }) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedClientId > 0 && (
                <FormControl fullWidth margin="dense">
                  <InputLabel>Project (Optional)</InputLabel>
                  <Select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                    label="Project (Optional)"
                  >
                    <MenuItem value={0}>No project selected</MenuItem>
                    {projects.map((project: { id: number; name: string }) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isBillable}
                    onChange={(e) => setIsBillable(e.target.checked)}
                  />
                }
                label="Billable"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStopDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStopTimer}
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            disabled={createWorkEntry && !selectedClientId}
          >
            Stop Timer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Timer;
