import { useState, useEffect } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core'
import { Bucket, Task } from '../types/task'
import { getBuckets, moveTask } from '../api/taskApi'
import BucketColumn from '../components/BucketColumn'
import TaskCard from '../components/TaskCard'
import TaskDialog from '../components/TaskDialog'

function TaskBoardPage() {
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const fetchBuckets = async () => {
    try {
      setLoading(true)
      const data = await getBuckets()
      setBuckets(data)
      setError(null)
    } catch (err) {
      setError('Failed to load tasks. Please try again.')
      console.error('Error fetching buckets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBuckets()
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const taskId = active.id as number
    
    for (const bucket of buckets) {
      const task = bucket.tasks.find(t => t.id === taskId)
      if (task) {
        setActiveTask(task)
        break
      }
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as number
    const overId = over.id

    let sourceBucket: Bucket | undefined
    let sourceTask: Task | undefined
    let targetBucket: Bucket | undefined

    for (const bucket of buckets) {
      const task = bucket.tasks.find(t => t.id === activeId)
      if (task) {
        sourceBucket = bucket
        sourceTask = task
        break
      }
    }

    if (typeof overId === 'string' && overId.startsWith('bucket-')) {
      const bucketId = parseInt(overId.replace('bucket-', ''))
      targetBucket = buckets.find(b => b.id === bucketId)
    } else {
      for (const bucket of buckets) {
        if (bucket.tasks.find(t => t.id === overId)) {
          targetBucket = bucket
          break
        }
      }
    }

    if (!sourceBucket || !sourceTask || !targetBucket) return
    if (sourceBucket.id === targetBucket.id) return

    setBuckets(prevBuckets => {
      const newBuckets = prevBuckets.map(bucket => ({
        ...bucket,
        tasks: [...bucket.tasks],
      }))

      const sourceBucketIndex = newBuckets.findIndex(b => b.id === sourceBucket!.id)
      const targetBucketIndex = newBuckets.findIndex(b => b.id === targetBucket!.id)

      newBuckets[sourceBucketIndex].tasks = newBuckets[sourceBucketIndex].tasks.filter(
        t => t.id !== activeId
      )

      const updatedTask = { ...sourceTask!, bucketId: targetBucket!.id }
      newBuckets[targetBucketIndex].tasks.push(updatedTask)

      return newBuckets
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as number
    const overId = over.id

    let targetBucketId: number = 0
    let targetPosition: number = 0

    if (typeof overId === 'string' && overId.startsWith('bucket-')) {
      targetBucketId = parseInt(overId.replace('bucket-', ''))
      const targetBucket = buckets.find(b => b.id === targetBucketId)
      targetPosition = targetBucket ? targetBucket.tasks.length : 0
    } else {
      let targetTask: Task | undefined
      for (const bucket of buckets) {
        targetTask = bucket.tasks.find(t => t.id === overId)
        if (targetTask) {
          targetBucketId = bucket.id
          targetPosition = targetTask.position
          break
        }
      }
      if (!targetTask) return
    }

    try {
      await moveTask(activeId, {
        targetBucketId: targetBucketId,
        targetPosition: targetPosition,
      })
      await fetchBuckets()
    } catch (err) {
      console.error('Error moving task:', err)
      await fetchBuckets()
    }
  }

  const handleTaskCreated = () => {
    fetchBuckets()
  }

  const handleTaskDeleted = () => {
    fetchBuckets()
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Tracker
          </Typography>
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            New Task
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ flexGrow: 1, py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              minHeight: 'calc(100vh - 150px)',
            }}
          >
            {buckets.map(bucket => (
              <BucketColumn
                key={bucket.id}
                bucket={bucket}
                onTaskDeleted={handleTaskDeleted}
              />
            ))}
          </Box>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </Container>

      <TaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onTaskCreated={handleTaskCreated}
        buckets={buckets}
      />
    </Box>
  )
}

export default TaskBoardPage
