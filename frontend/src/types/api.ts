export interface User {
  email: string;
  mobile?: string | null;
  createdAt: string;
}

export interface Client {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  client_id: number;
  name: string;
  description: string | null;
  user_email: string;
  created_at: string;
  updated_at: string;
  client_name?: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  user_email: string;
  created_at: string;
}

export interface TimerSession {
  id: number;
  user_email: string;
  client_id: number | null;
  project_id: number | null;
  description: string | null;
  start_time: string;
  is_active: boolean;
  created_at: string;
  client_name?: string;
  project_name?: string;
}

export interface WorkEntry {
  id: number;
  client_id: number;
  project_id: number | null;
  hours: number;
  description: string | null;
  date: string;
  is_billable: boolean;
  created_at: string;
  updated_at: string;
  client_name?: string;
  project_name?: string;
}

export interface WorkEntryWithClient extends WorkEntry {
  client_name: string;
}

export interface ClientReport {
  client: Client;
  workEntries: WorkEntry[];
  totalHours: number;
  entryCount: number;
}

export interface CreateClientRequest {
  name: string;
  description?: string;
}

export interface UpdateClientRequest {
  name?: string;
  description?: string;
}

export interface CreateWorkEntryRequest {
  clientId: number;
  projectId?: number | null;
  hours: number;
  description?: string;
  date: string;
  isBillable?: boolean;
}

export interface UpdateWorkEntryRequest {
  clientId?: number;
  projectId?: number | null;
  hours?: number;
  description?: string;
  date?: string;
  isBillable?: boolean;
}

export interface CreateProjectRequest {
  clientId: number;
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  clientId?: number;
}

export interface CreateTagRequest {
  name: string;
  color?: string;
}

export interface UpdateTagRequest {
  name?: string;
  color?: string;
}

export interface StartTimerRequest {
  clientId?: number;
  projectId?: number;
  description?: string;
}

export interface StopTimerRequest {
  createWorkEntry?: boolean;
  clientId?: number;
  projectId?: number;
  description?: string;
  isBillable?: boolean;
}

export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
