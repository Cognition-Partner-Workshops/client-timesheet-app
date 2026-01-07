import { useState } from 'react'
import {
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
  Box,
  Alert,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Dayjs } from 'dayjs'
import { Bucket, CreateTaskRequest } from '../types/task'
import { createTask } from '../api/taskApi'

interface TaskDialogProps {
  open: boolean
  onClose: () => void
  onTaskCreated: () => void
  buckets: Bucket[]
}

function TaskDialog({ open, onClose, onTaskCreated, buckets }: TaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [priority, setPriority] = useState('')
  const [startedOn, setStartedOn] = useState<Dayjs | null>(null)
  const [dueDate, setDueDate] = useState<Dayjs | null>(null)
  const [bucketId, setBucketId] = useState<number>(buckets[0]?.id || 0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setAssignedTo('')
    setPriority('')
    setStartedOn(null)
    setDueDate(null)
    setBucketId(buckets[0]?.id || 0)
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const taskData: CreateTaskRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        assignedTo: assignedTo.trim() || undefined,
        priority: priority || undefined,
        startedOn: startedOn ? startedOn.format('YYYY-MM-DD') : undefined,
        dueDate: dueDate ? dueDate.format('YYYY-MM-DD') : undefined,
        bucketId,
      }

      await createTask(taskData)
      onTaskCreated()
      handleClose()
    } catch (err) {
      setError('Failed to create task. Please try again.')
      console.error('Error creating task:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            fullWidth
            required
            autoFocus
          />

          <TextField
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />

          <TextField
            label="Assigned To"
            value={assignedTo}
            onChange={e => setAssignedTo(e.target.value)}
            fullWidth
          />

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

          <FormControl fullWidth>
            <InputLabel>Bucket</InputLabel>
            <Select
              value={bucketId}
              label="Bucket"
              onChange={e => setBucketId(e.target.value as number)}
            >
              {buckets.map(bucket => (
                <MenuItem key={bucket.id} value={bucket.id}>
                  {bucket.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" gap={2}>
            <DatePicker
              label="Started On"
              value={startedOn}
              onChange={setStartedOn}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="Due Date"
              value={dueDate}
              onChange={setDueDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {saving ? 'Creating...' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TaskDialog
