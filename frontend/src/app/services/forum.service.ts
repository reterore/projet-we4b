import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  author: string;
  content: string;
  timestamp: string;
}

export interface Forum {
  _id?: string;
  title: string;
  courseId: string;
  messages: Message[];
}

@Injectable({ providedIn: 'root' })
export class ForumService {
  private apiUrl = 'http://localhost:3000/api/forums';

  constructor(private http: HttpClient) {}

  createForum(forum: Forum): Observable<Forum> {
    return this.http.post<Forum>(this.apiUrl, forum);
  }

  addMessage(forumId: string, message: Message): Observable<Forum> {
    return this.http.post<Forum>(`${this.apiUrl}/${forumId}/messages`, message);
  }

  getForumsByCourse(courseId: string): Observable<Forum[]> {
    return this.http.get<Forum[]>(`${this.apiUrl}/by-course/${courseId}`);
  }
}
