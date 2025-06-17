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
  teacherId: string | Teacher;  // Peut être l'ID ou un objet selon le contexte
}


@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient) {}

  // 📚 Récupérer tous les cours
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  // ➕ Créer un cours
  createCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course);
  }

  // 🗑️ Supprimer un cours
  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ✏️ Modifier un cours
  updateCourse(id: string, data: Partial<Course>) {
    return this.http.put(`http://localhost:3000/api/courses/${id}`, data);
  }



  // 🔍 Obtenir un cours par ID
  getCourse(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  getTeacherName(course: Course): string {
    const teacher = course.teacherId;
    if (teacher && typeof teacher === 'object' && 'name' in teacher && 'surname' in teacher) {
      return `${teacher.name} ${teacher.surname}`;
    }
    return `(ID: ${teacher})`;
  }

}

