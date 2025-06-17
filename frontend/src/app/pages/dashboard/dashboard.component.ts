import { Component, OnInit } from '@angular/core';
import { Course, CourseService } from 'src/app/services/course.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';

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
  isProf: boolean = false;
  allUsers: User[] = [];
  allCourses: Course[] = [];
  editingCourse: Course | null = null;
  courseTitle: string = '';
  courseDescription: string = '';


  constructor(
    private courseService: CourseService,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.auth.getUserId();

    if (!userId) {
      console.error('❌ Utilisateur non connecté.');
      this.router.navigate(['/login']);
      return;
    }

    // 🔄 Charger les infos utilisateur
    this.http.get<User>(`http://localhost:3000/api/users/${userId}`).subscribe({
      next: user => {
        this.user = user;
        this.isProf = user.role === 'teacher';

        // 📚 Charger tous les cours
        this.courseService.getCourses().subscribe(allCourses => {
          // 🎯 Filtrer les cours sélectionnés par l'utilisateur
          this.courses = allCourses.filter(course =>
            user.selectedCourses?.includes(course._id ?? '')
          );

          // 👨‍🏫 Si prof, afficher tous les cours
          if (this.isProf) {
            this.allCourses = allCourses;
          }
        });

        // 👥 Si prof, charger tous les utilisateurs
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

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
  startEditing(course: Course) {
    this.editingCourse = { ...course }; // On copie pour ne pas modifier directement
    this.courseTitle = course.title;
    this.courseDescription = course.description;
  }

  cancelEditing() {
    this.editingCourse = null;
    this.courseTitle = '';
    this.courseDescription = '';
  }

  saveCourseChanges() {
    if (!this.editingCourse) return;

    const updated = {
      title: this.courseTitle,
      description: this.courseDescription,
      teacherId: this.editingCourse.teacherId // ⚠️ important si requis côté backend
    };

    this.courseService.updateCourse(this.editingCourse._id!, updated).subscribe({
      next: () => {
        // Recharger les cours pour voir les changements
        this.ngOnInit();
        this.cancelEditing();
      },
      error: err => console.error('Erreur modification cours', err)
    });
  }


  // 🔎 Récupération du nom complet du professeur
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
