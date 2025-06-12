import { Component, OnInit } from '@angular/core';
import { Course, CourseService } from 'src/app/services/course.service';
import { UserService } from 'src/app/services/user.service';
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

  constructor(
    private courseService: CourseService,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.auth.getUserId();
    if (!userId) {
      console.error('Utilisateur non connecté.');
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<User>(`http://localhost:3000/api/users/${userId}`).subscribe({
      next: user => {
        this.user = user;
        this.isProf = user.role === 'teacher'; // ✅ Vérification du rôle

        // Récupérer tous les cours
        this.courseService.getCourses().subscribe(allCourses => {
          // Cours sélectionnés par l'utilisateur
          this.courses = allCourses.filter(course =>
            user.selectedCourses?.includes(course._id ?? '')
          );

          // Si prof, stocker aussi tous les cours
          if (this.isProf) {
            this.allCourses = allCourses;
          }
        });

        // Si prof, charger tous les utilisateurs
        if (this.isProf) {
          this.http.get<User[]>('http://localhost:3000/api/users').subscribe({
            next: users => this.allUsers = users,
            error: err => console.error('Erreur chargement des utilisateurs :', err)
          });
        }
      },
      error: err => {
        console.error('Erreur utilisateur :', err);
        this.router.navigate(['/login']);
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }


}
