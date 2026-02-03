export interface User {
  email: string;
  createdAt: string;
}

export interface Client {
  id: number;
  name: string;
  description: string | null;
  department: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkEntry {
  id: number;
  client_id: number;
  activity_id: number | null;
  hours: number;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
  client_name?: string;
  activity_name?: string | null;
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
  department?: string;
  email?: string;
}

export interface UpdateClientRequest {
  name?: string;
  description?: string;
  department?: string;
  email?: string;
}

export interface CreateActivityRequest {
  name: string;
  description?: string;
}

export interface UpdateActivityRequest {
  name?: string;
  description?: string;
}

export interface CreateWorkEntryRequest {
  clientId: number;
  activityId?: number | null;
  hours: number;
  description?: string;
  date: string;
}

export interface UpdateWorkEntryRequest {
  clientId?: number;
  activityId?: number | null;
  hours?: number;
  description?: string;
  date?: string;
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
