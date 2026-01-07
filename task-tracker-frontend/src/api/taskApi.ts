import axios from 'axios'
import { Bucket, Task, CreateTaskRequest, UpdateTaskRequest, MoveTaskRequest } from '../types/task'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getBuckets = async (): Promise<Bucket[]> => {
  const response = await api.get('/api/buckets')
  return response.data
}

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/api/tasks')
  return response.data
}

export const getTaskById = async (id: number): Promise<Task> => {
  const response = await api.get(`/api/tasks/${id}`)
  return response.data
}

export const createTask = async (task: CreateTaskRequest): Promise<Task> => {
  const response = await api.post('/api/tasks', task)
  return response.data
}

export const updateTask = async (id: number, task: UpdateTaskRequest): Promise<Task> => {
  const response = await api.put(`/api/tasks/${id}`, task)
  return response.data
}

export const moveTask = async (id: number, moveRequest: MoveTaskRequest): Promise<Task> => {
  const response = await api.put(`/api/tasks/${id}/move`, moveRequest)
  return response.data
}

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/api/tasks/${id}`)
}
