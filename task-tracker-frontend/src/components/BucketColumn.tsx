import { Box, Paper, Typography } from '@mui/material'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Bucket } from '../types/task'
import TaskCard from './TaskCard'

interface BucketColumnProps {
  bucket: Bucket
  onTaskDeleted: () => void
}

function BucketColumn({ bucket, onTaskDeleted }: BucketColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `bucket-${bucket.id}`,
  })

  const getBucketColor = (name: string): string => {
    switch (name.toLowerCase()) {
      case 'to do':
        return '#e3f2fd'
      case 'in progress':
        return '#fff3e0'
      case 'review':
        return '#f3e5f5'
      case 'done':
        return '#e8f5e9'
      default:
        return '#f5f5f5'
    }
  }

  const getBucketHeaderColor = (name: string): string => {
    switch (name.toLowerCase()) {
      case 'to do':
        return '#1976d2'
      case 'in progress':
        return '#f57c00'
      case 'review':
        return '#7b1fa2'
      case 'done':
        return '#388e3c'
      default:
        return '#757575'
    }
  }

  return (
    <Paper
      ref={setNodeRef}
      sx={{
        minWidth: 300,
        maxWidth: 300,
        backgroundColor: isOver ? '#e0e0e0' : getBucketColor(bucket.name),
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
      }}
      elevation={2}
    >
      <Box
        sx={{
          backgroundColor: getBucketHeaderColor(bucket.name),
          color: 'white',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {bucket.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {bucket.tasks.length}
        </Typography>
      </Box>

      <Box
        sx={{
          p: 1,
          flexGrow: 1,
          minHeight: 200,
          overflowY: 'auto',
        }}
      >
        <SortableContext
          items={bucket.tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {bucket.tasks.map(task => (
            <TaskCard key={task.id} task={task} onDeleted={onTaskDeleted} />
          ))}
        </SortableContext>
      </Box>
    </Paper>
  )
}

export default BucketColumn
