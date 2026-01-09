export interface User {
  email: string;
  createdAt: string;
}

export interface Client {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkEntry {
  id: number;
  client_id: number;
  hours: number;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
  client_name?: string;
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
  hours: number;
  description?: string;
  date: string;
}

export interface UpdateWorkEntryRequest {
  clientId?: number;
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

export interface Defaulter {
  id: number;
  name: string;
  description: string | null;
  lastEntryDate: string;
  daysSinceLastEntry: number;
  totalHours: number;
  entryCount: number;
  status: 'ok' | 'warning' | 'critical';
}

export interface DefaultersSummary {
  totalClients: number;
  defaultersCount: number;
  criticalCount: number;
  warningCount: number;
  daysThreshold: number;
}

export interface DefaultersReport {
  defaulters: Defaulter[];
  allClients: Defaulter[];
  summary: DefaultersSummary;
}
