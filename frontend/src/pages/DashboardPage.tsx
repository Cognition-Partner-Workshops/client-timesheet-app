import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.getClients(),
  });

  const { data: workEntriesData } = useQuery({
    queryKey: ['workEntries'],
    queryFn: () => apiClient.getWorkEntries(),
  });

  const clients = clientsData?.clients || [];
  const workEntries = workEntriesData?.workEntries || [];

  const totalHours = workEntries.reduce((sum: number, entry: { hours: number }) => sum + entry.hours, 0);
  const recentEntries = workEntries.slice(0, 5);

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

  useEffect(() => {
    if (isHovering) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % statsCards.length);
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovering, statsCards.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + statsCards.length) % statsCards.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % statsCards.length);
  };

  const currentStat = statsCards[currentIndex];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Box
        sx={{ mb: 4, position: 'relative' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <IconButton
            onClick={handlePrevious}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <Box
            sx={{
              width: '100%',
              maxWidth: 400,
              overflow: 'hidden',
            }}
          >
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                transform: isHovering ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isHovering ? 6 : 1,
              }}
              onClick={currentStat.action}
            >
              <CardContent sx={{ py: 4 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={3}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      {currentStat.title}
                    </Typography>
                    <Typography variant="h3" component="div">
                      {currentStat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: currentStat.color,
                      borderRadius: 2,
                      p: 2,
                      color: 'white',
                      flexShrink: 0,
                    }}
                  >
                    {React.cloneElement(currentStat.icon, { sx: { fontSize: 40 } })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <IconButton
            onClick={handleNext}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mt: 2,
          }}
        >
          {statsCards.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: index === currentIndex ? 'primary.main' : 'grey.300',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                '&:hover': {
                  backgroundColor: index === currentIndex ? 'primary.main' : 'grey.400',
                },
              }}
            />
          ))}
        </Box>

        {isHovering && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 1,
              color: 'text.secondary',
            }}
          >
            Auto-rotating... Click to navigate
          </Typography>
        )}
      </Box>

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
