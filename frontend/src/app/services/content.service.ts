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
  private apiUrl = 'http://localhost:3000/api/contents';
  constructor(private http: HttpClient) {}

  getContentsByCourse(courseId: string): Observable<Content[]> {
    return this.http.get<Content[]>(`${this.apiUrl}/course/${courseId}`);
  }
  addContent(contentData: FormData) {
    return this.http.post<Content>('http://localhost:3000/api/contents', contentData);
  }

  getContentsByModule(moduleId: string): Observable<Content[]> {
    return this.http.get<Content[]>(`${this.apiUrl}/module/${moduleId}`);
  }
  deleteContent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateContent(id: string, data: { title: string; text: string }): Observable<Content> {
    return this.http.put<Content>(`${this.apiUrl}/${id}`, data);
  }


}
