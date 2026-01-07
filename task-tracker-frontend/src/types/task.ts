export interface Task {
  id: number
  title: string
  description: string | null
  assignedTo: string | null
  priority: string | null
  startedOn: string | null
  dueDate: string | null
  actualEndDate: string | null
  position: number
  bucketId: number
  bucketName: string
  createdAt: string
  updatedAt: string
}

export interface Bucket {
  id: number
  name: string
  position: number
  tasks: Task[]
}

export interface CreateTaskRequest {
  title: string
  description?: string
  assignedTo?: string
  priority?: string
  startedOn?: string
  dueDate?: string
  actualEndDate?: string
  bucketId: number
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  assignedTo?: string
  priority?: string
  startedOn?: string
  dueDate?: string
  actualEndDate?: string
  bucketId?: number
}

export interface MoveTaskRequest {
  targetBucketId: number
  targetPosition: number
}
