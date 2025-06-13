import { Component, OnInit } from '@angular/core';
import { UserService, User } from 'src/app/services/user.service';
import { CourseService, Course } from 'src/app/services/course.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  courses: Course[] = [];
  currentTab: 'users' | 'courses' = 'users';

  userError = false;
  courseError = false;

  constructor(
    private userService: UserService,
    private courseService: CourseService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute // ← Ajout pour lire les query params
  ) {}

  ngOnInit(): void {
    // 🔁 Détecte le paramètre `tab` dans l'URL
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab === 'courses' || tab === 'users') {
        this.currentTab = tab;
      }
    });

    this.loadUsers();
    this.loadCourses();
  }

  setTab(tab: 'users' | 'courses') {
    this.currentTab = tab;
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: users => {
        this.users = users;
        this.userError = false;
      },
      error: err => {
        console.error('❌ Erreur chargement utilisateurs :', err);
        this.userError = true;
        this.users = [];
      }
    });
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: courses => {
        this.courses = courses;
        this.courseError = false;
      },
      error: err => {
        console.error('❌ Erreur chargement cours :', err);
        this.courseError = true;
        this.courses = [];
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  editUser(userId?: string): void {
    if (userId) {
      this.router.navigate(['/edit-user', userId]);
    }
  }

  deleteUser(userId?: string): void {
    if (userId && confirm('❗ Supprimer cet utilisateur ?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => this.loadUsers(),
        error: err => console.error('❌ Erreur suppression utilisateur :', err)
      });
    }
  }

  editCourse(courseId?: string): void {
    if (courseId) {
      this.router.navigate(['/edit-course', courseId]);
    }
  }

  deleteCourse(courseId?: string): void {
    if (courseId && confirm('❗ Supprimer ce cours ?')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => this.loadCourses(),
        error: err => console.error('❌ Erreur suppression cours :', err)
      });
    }
  }
}
