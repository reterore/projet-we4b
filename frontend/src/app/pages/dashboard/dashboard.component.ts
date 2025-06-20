import { Component, OnInit } from '@angular/core';
import { Course, CourseService } from 'src/app/services/course.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { LogService } from 'src/app/services/log.service';

interface User {
  _id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  selectedCourses: string[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  courses: Course[] = [];
  isProf = false;
  allUsers: User[] = [];
  allCourses: Course[] = [];
  editingCourse: Course | null = null;
  courseTitle = '';
  courseDescription = '';

  constructor(
    private courseService: CourseService,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService,
    private logService: LogService
  ) {}

  ngOnInit(): void {
    const userId = this.auth.getUserId();

    if (!userId) {
      console.error('❌ Utilisateur non connecté.');
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<User>(`http://localhost:3000/api/users/${userId}`).subscribe({
      next: user => {
        this.user = user;
        this.isProf = user.role === 'teacher';

        this.courseService.getCourses().subscribe(allCourses => {
          this.courses = allCourses.filter(course =>
            user.selectedCourses?.includes(course._id ?? '')
          );

          if (this.isProf) {
            this.allCourses = allCourses;
          }
        });

        if (this.isProf) {
          this.http.get<User[]>('http://localhost:3000/api/users').subscribe({
            next: users => this.allUsers = users,
            error: err => console.error('❌ Erreur chargement utilisateurs :', err)
          });
        }
      },
      error: err => {
        console.error('❌ Erreur récupération utilisateur :', err);
        this.router.navigate(['/login']);
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  startEditing(course: Course): void {
    this.editingCourse = { ...course };
    this.courseTitle = course.title;
    this.courseDescription = course.description;
  }

  cancelEditing(): void {
    this.editingCourse = null;
    this.courseTitle = '';
    this.courseDescription = '';
  }

  saveCourseChanges(): void {
    if (!this.editingCourse) return;

    const updated = {
      title: this.courseTitle,
      description: this.courseDescription,
      teacherId: this.editingCourse.teacherId
    };

    this.courseService.updateCourse(this.editingCourse._id!, updated).subscribe({
      next: () => {
        this.ngOnInit();
        this.cancelEditing();
      },
      error: err => console.error('Erreur modification cours', err)
    });
  }

  getTeacherName(course: Course): string {
    const teacher = course.teacherId;
    if (teacher && typeof teacher === 'object') {
      const name = (teacher as any).name;
      const surname = (teacher as any).surname;
      if (name && surname) return `${name} ${surname}`;
    }
    return `(Prof inconnu: ${teacher})`;
  }


}
