import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Teacher {
  _id: string;
  name: string;
  surname: string;
}

export interface Course {
  _id?: string;
  title: string;
  description: string;
  teacherId: string | Teacher;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient) {}

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  createCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course);
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateCourse(id: string, data: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, data);
  }

  getCourse(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

}
