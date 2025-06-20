import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Assignment {
  _id: string;
  courseId: string;
  title: string;
  dueDate: string;
  description: string;
  submissions: Submission[];
}

export interface Submission {
  studentId: string;
  studentName: string;
  file: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
  };
  status: string;
  grade: number | null;
  comment: string | null;
  submittedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private baseUrl = 'http://localhost:3000/api/assignments';

  constructor(private http: HttpClient) {}

  getAssignmentsByCourse(courseId: string): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.baseUrl}/course/${courseId}`);
  }

  createAssignment(assignment: { title: string; dueDate: string; description: string; courseId: string }): Observable<Assignment> {
    return this.http.post<Assignment>(this.baseUrl, assignment);
  }

  submitAssignment(assignmentId: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/${assignmentId}/submit`, formData);
  }
  gradeSubmission(assignmentId: string, submissionId: string, data: { grade: number, comment: string }) {
    return this.http.post(`${this.baseUrl}/${assignmentId}/grade/${submissionId}`, data);
  }
  deleteAssignment(id: string) {
    return this.http.delete(`${this.baseUrl}/assignments/${id}`);
  }

}
