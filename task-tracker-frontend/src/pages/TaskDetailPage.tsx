import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Grid,
  Divider,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { Task, Bucket, UpdateTaskRequest } from '../types/task'
import { getTaskById, updateTask, deleteTask, getBuckets } from '../api/taskApi'

function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [task, setTask] = useState<Task | null>(null)
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [priority, setPriority] = useState('')
  const [startedOn, setStartedOn] = useState<Dayjs | null>(null)
  const [dueDate, setDueDate] = useState<Dayjs | null>(null)
  const [actualEndDate, setActualEndDate] = useState<Dayjs | null>(null)
  const [bucketId, setBucketId] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setLoading(true)
        const [taskData, bucketsData] = await Promise.all([
          getTaskById(parseInt(id)),
          getBuckets(),
        ])

        setTask(taskData)
        setBuckets(bucketsData)

        setTitle(taskData.title)
        setDescription(taskData.description || '')
        setAssignedTo(taskData.assignedTo || '')
        setPriority(taskData.priority || '')
        setStartedOn(taskData.startedOn ? dayjs(taskData.startedOn) : null)
        setDueDate(taskData.dueDate ? dayjs(taskData.dueDate) : null)
        setActualEndDate(taskData.actualEndDate ? dayjs(taskData.actualEndDate) : null)
        setBucketId(taskData.bucketId)

        setError(null)
      } catch (err) {
        setError('Failed to load task. Please try again.')
        console.error('Error fetching task:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleSave = async () => {
    if (!id || !title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      const updateData: UpdateTaskRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        assignedTo: assignedTo.trim() || undefined,
        priority: priority || undefined,
        startedOn: startedOn ? startedOn.format('YYYY-MM-DD') : undefined,
        dueDate: dueDate ? dueDate.format('YYYY-MM-DD') : undefined,
        actualEndDate: actualEndDate ? actualEndDate.format('YYYY-MM-DD') : undefined,
        bucketId,
      }

      const updatedTask = await updateTask(parseInt(id), updateData)
      setTask(updatedTask)
      setSuccessMessage('Task updated successfully!')

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError('Failed to update task. Please try again.')
      console.error('Error updating task:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return

    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      await deleteTask(parseInt(id))
      navigate('/')
    } catch (err) {
      setError('Failed to delete task. Please try again.')
      console.error('Error deleting task:', err)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!task) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">Task not found</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Details
          </Typography>
          <Button
            color="inherit"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            color="inherit"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            sx={{ ml: 1 }}
          >
            Delete
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Task ID
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                #{task.id}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Task Name"
                value={title}
                onChange={e => setTitle(e.target.value)}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={bucketId}
                  label="Status"
                  onChange={e => setBucketId(e.target.value as number)}
                >
                  {buckets.map(bucket => (
                    <MenuItem key={bucket.id} value={bucket.id}>
                      {bucket.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Assigned To"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  label="Priority"
                  onChange={e => setPriority(e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Started On"
                value={startedOn}
                onChange={setStartedOn}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Due Date"
                value={dueDate}
                onChange={setDueDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Actual End Date"
                value={actualEndDate}
                onChange={setActualEndDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Created At
              </Typography>
              <Typography variant="body2">
                {new Date(task.createdAt).toLocaleString()}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Last Updated
              </Typography>
              <Typography variant="body2">
                {new Date(task.updatedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  )
}

export default TaskDetailPage
