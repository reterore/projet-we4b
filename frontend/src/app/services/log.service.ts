import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LogEntry {
  userId: string;
  action: string;
  details?: Record<string, any>;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private readonly API_URL = 'http://localhost:3000/api/logs'; // Assure-toi que cette URL est correcte

  constructor(private http: HttpClient) {}

  /**
   * Envoie un log au backend
   * @param entry Objet contenant userId, action, et éventuellement des détails
   */
  sendLog(entry: LogEntry): Observable<LogEntry> {
    return this.http.post<LogEntry>(this.API_URL, entry);
  }

  /**
   * Récupère tous les logs du backend
   */
  getAllLogs(): Observable<LogEntry[]> {
    return this.http.get<LogEntry[]>(this.API_URL);
  }
}
