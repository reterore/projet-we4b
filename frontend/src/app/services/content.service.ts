import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Content {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  courseId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = '/api/contents';

  constructor(private http: HttpClient) {}

  getContentsByCourse(courseId: string): Observable<Content[]> {
    return this.http.get<Content[]>(`${this.apiUrl}/course/${courseId}`);
  }
}
