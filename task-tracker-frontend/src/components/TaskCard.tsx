import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '../types/task'
import { deleteTask } from '../api/taskApi'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  onDeleted?: () => void
}

function TaskCard({ task, isDragging = false, onDeleted }: TaskCardProps) {
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const getPriorityColor = (priority: string | null): 'error' | 'warning' | 'info' | 'default' => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'default'
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle') || 
        (e.target as HTMLElement).closest('.delete-button')) {
      return
    }
    navigate(`/task/${task.id}`)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      await deleteTask(task.id)
      setDeleteDialogOpen(false)
      if (onDeleted) {
        onDeleted()
      }
    } catch (err) {
      console.error('Error deleting task:', err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        sx={{
          mb: 1,
          cursor: 'pointer',
          boxShadow: isDragging ? 4 : 1,
          '&:hover': {
            boxShadow: 3,
          },
        }}
        onClick={handleCardClick}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box display="flex" alignItems="flex-start" gap={1}>
            <Box
              className="drag-handle"
              {...attributes}
              {...listeners}
              sx={{
                cursor: 'grab',
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                '&:active': { cursor: 'grabbing' },
              }}
            >
              <DragIndicatorIcon fontSize="small" />
            </Box>

            <Box flexGrow={1} minWidth={0}>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {task.title}
              </Typography>

              {task.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    mt: 0.5,
                  }}
                >
                  {task.description}
                </Typography>
              )}

              <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                {task.priority && (
                  <Chip
                    label={task.priority}
                    size="small"
                    color={getPriorityColor(task.priority)}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
                {task.assignedTo && (
                  <Chip
                    label={task.assignedTo}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            </Box>

            <IconButton
              className="delete-button"
              size="small"
              onClick={handleDeleteClick}
              sx={{ color: 'text.secondary' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{task.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TaskCard
