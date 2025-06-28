import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface LogEntry {
  userId: string;
  action: 'login' | 'logout' | 'course_view' | 'course_created' | 'course_deleted' | 'course_updated';
  details?: Record<string, any>;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private readonly API_URL = 'http://localhost:3000/api/logs';

  constructor(private http: HttpClient) {}

  sendLog(entry: LogEntry): Observable<LogEntry> {
    return this.http.post<LogEntry>(this.API_URL, entry).pipe(
      catchError(err => {
        console.warn('⚠Erreur lors de l’envoi du log :', err);
        return of({} as LogEntry);
      })
    );
  }
  getAllLogs(): Observable<LogEntry[]> {
    return this.http.get<LogEntry[]>(this.API_URL).pipe(
      catchError(err => {
        console.error('❌ Erreur récupération des logs :', err);
        return of([]);
      })
    );
  }
}
