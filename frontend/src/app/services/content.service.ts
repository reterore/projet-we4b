import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Content {
  _id: string;
  title: string;
  type: 'text' | 'file';
  text?: string;
  filename?: string;
  description?: string;
  fileUrl?: string;
  courseId: string;
  moduleId: string; //
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
  addContent(formData: FormData): Observable<Content> {
    return this.http.post<Content>(this.apiUrl, formData);
  }

  getContentsByModule(moduleId: string): Observable<Content[]> {
    return this.http.get<Content[]>(`${this.apiUrl}/module/${moduleId}`);
  }

}
