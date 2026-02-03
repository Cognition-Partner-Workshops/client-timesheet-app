import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  User,
  Client,
  ClientsResponse,
  WorkEntriesResponse,
  ClientReport,
  CreateClientRequest,
  UpdateClientRequest,
  CreateWorkEntryRequest,
  UpdateWorkEntryRequest,
  LoginResponse
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const userEmail = localStorage.getItem('userEmail');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (userEmail) {
      headers = headers.set('x-user-email', userEmail);
    }
    return headers;
  }

  // Auth endpoints
  login(email: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { email }, { headers: this.getHeaders() });
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>('/api/auth/me', { headers: this.getHeaders() });
  }

  // Client endpoints
  getClients(): Observable<ClientsResponse> {
    return this.http.get<ClientsResponse>('/api/clients', { headers: this.getHeaders() });
  }

  getClient(id: number): Observable<{ client: Client }> {
    return this.http.get<{ client: Client }>(`/api/clients/${id}`, { headers: this.getHeaders() });
  }

  createClient(clientData: CreateClientRequest): Observable<{ client: Client }> {
    return this.http.post<{ client: Client }>('/api/clients', clientData, { headers: this.getHeaders() });
  }

  updateClient(id: number, clientData: UpdateClientRequest): Observable<{ client: Client }> {
    return this.http.put<{ client: Client }>(`/api/clients/${id}`, clientData, { headers: this.getHeaders() });
  }

  deleteClient(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/clients/${id}`, { headers: this.getHeaders() });
  }

  // Work entry endpoints
  getWorkEntries(clientId?: number): Observable<WorkEntriesResponse> {
    let options: { headers: HttpHeaders; params?: { clientId: string } } = { headers: this.getHeaders() };
    if (clientId) {
      options.params = { clientId: clientId.toString() };
    }
    return this.http.get<WorkEntriesResponse>('/api/work-entries', options);
  }

  getWorkEntry(id: number): Observable<{ workEntry: any }> {
    return this.http.get<{ workEntry: any }>(`/api/work-entries/${id}`, { headers: this.getHeaders() });
  }

  createWorkEntry(entryData: CreateWorkEntryRequest): Observable<{ workEntry: any }> {
    return this.http.post<{ workEntry: any }>('/api/work-entries', entryData, { headers: this.getHeaders() });
  }

  updateWorkEntry(id: number, entryData: UpdateWorkEntryRequest): Observable<{ workEntry: any }> {
    return this.http.put<{ workEntry: any }>(`/api/work-entries/${id}`, entryData, { headers: this.getHeaders() });
  }

  deleteWorkEntry(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/work-entries/${id}`, { headers: this.getHeaders() });
  }

  // Report endpoints
  getClientReport(clientId: number): Observable<ClientReport> {
    return this.http.get<ClientReport>(`/api/reports/client/${clientId}`, { headers: this.getHeaders() });
  }

  exportClientReportCsv(clientId: number): Observable<Blob> {
    return this.http.get(`/api/reports/export/csv/${clientId}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  exportClientReportPdf(clientId: number): Observable<Blob> {
    return this.http.get(`/api/reports/export/pdf/${clientId}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // Health check
  healthCheck(): Observable<any> {
    return this.http.get('/health');
  }
}
