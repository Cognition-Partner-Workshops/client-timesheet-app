import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { type Tag } from '../types/api';

const PRESET_COLORS = [
  '#1976d2', // Blue
  '#388e3c', // Green
  '#d32f2f', // Red
  '#f57c00', // Orange
  '#7b1fa2', // Purple
  '#0097a7', // Cyan
  '#c2185b', // Pink
  '#455a64', // Blue Grey
  '#5d4037', // Brown
  '#616161', // Grey
];

const TagsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#1976d2',
  });
  const [error, setError] = useState<string | null>(null);

  const { data: tagsData, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => apiClient.getTags(),
  });

  const tags: Tag[] = tagsData?.tags || [];

  const createMutation = useMutation({
    mutationFn: (data: { name: string; color?: string }) =>
      apiClient.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      handleCloseDialog();
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create tag');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; color?: string } }) =>
      apiClient.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      handleCloseDialog();
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to update tag');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to delete tag');
    },
  });

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        color: tag.color,
      });
    } else {
      setEditingTag(null);
      setFormData({ name: '', color: '#1976d2' });
    }
    setError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTag(null);
    setFormData({ name: '', color: '#1976d2' });
    setError(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Tag name is required');
      return;
    }

    if (editingTag) {
      updateMutation.mutate({
        id: editingTag.id,
        data: {
          name: formData.name,
          color: formData.color,
        },
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        color: formData.color,
      });
    }
  };

  const handleDelete = (tag: Tag) => {
    if (window.confirm(`Are you sure you want to delete "${tag.name}"?`)) {
      deleteMutation.mutate(tag.id);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tags</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Tag
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {tags.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center">
              No tags yet. Create your first tag to categorize your work entries.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {tags.map((tag) => (
            // @ts-expect-error - MUI Grid item prop type issue
            <Grid item xs={12} sm={6} md={4} lg={3} key={tag.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip
                      label={tag.name}
                      sx={{
                        backgroundColor: tag.color,
                        color: '#fff',
                        fontWeight: 'medium',
                      }}
                    />
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(tag)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(tag)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Created: {new Date(tag.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTag ? 'Edit Tag' : 'Add Tag'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Tag Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Color
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {PRESET_COLORS.map((color) => (
                <Box
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #000' : '3px solid transparent',
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                />
              ))}
            </Box>
            <TextField
              margin="dense"
              label="Custom Color"
              fullWidth
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              sx={{ mt: 2 }}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Preview
            </Typography>
            <Chip
              label={formData.name || 'Tag Preview'}
              sx={{
                backgroundColor: formData.color,
                color: '#fff',
                fontWeight: 'medium',
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingTag ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TagsPage;
