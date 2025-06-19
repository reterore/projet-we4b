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
  private logUrl = 'http://localhost:3000/api/logs'; // ← Assure-toi que ton backend a une route POST /api/logs

  constructor(private http: HttpClient) {}

  /**
   * 📤 Envoie une entrée de log vers l'API Express
   * @param entry Données à logger (userId, action, détails optionnels)
   */
  sendLog(entry: LogEntry): Observable<any> {
    return this.http.post(this.logUrl, entry);
  }

  getAllLogs(): Observable<LogEntry[]> {
    return this.http.get<LogEntry[]>(this.logUrl);
  }

}
