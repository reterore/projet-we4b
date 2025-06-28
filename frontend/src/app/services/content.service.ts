import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Content {
  _id: string;
  title: string;
  type: 'text' | 'file';
  text?: string;
  file?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
  };
  moduleId: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private readonly apiUrl = 'http://localhost:3000/api/contents';
  private readonly progressUrl = 'http://localhost:3000/api/progress';

  constructor(private http: HttpClient) {}

  getContentsByModule(moduleId: string): Observable<Content[]> {
    return this.http.get<Content[]>(`${this.apiUrl}/module/${moduleId}`);
  }

  addContent(formData: FormData): Observable<Content> {
    return this.http.post<Content>(this.apiUrl, formData);
  }

  deleteContent(contentId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${contentId}`);
  }

  updateContent(contentId: string, data: { title: string; text: string }): Observable<Content> {
    return this.http.put<Content>(`${this.apiUrl}/${contentId}`, data);
  }

  markAsViewed(studentId: string, contentId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.progressUrl}/view`, { studentId, contentId });
  }

  isContentViewed(studentId: string, contentId: string): Observable<{ isViewed: boolean }> {
    return this.http.get<{ isViewed: boolean }>(`${this.progressUrl}/check/${studentId}/${contentId}`);
  }
}
