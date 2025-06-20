import { Component, OnInit } from '@angular/core';
import { UserService, User } from 'src/app/services/user.service';
import { CourseService, Course } from 'src/app/services/course.service';
import { LogService, LogEntry } from 'src/app/services/log.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  courses: Course[] = [];
  logs: LogEntry[] = [];
  currentTab: 'users' | 'courses' | 'logs' = 'users';

  newUser: Partial<User> = {};

  userError = false;
  courseError = false;
  logError = false;

  constructor(
    private userService: UserService,
    private courseService: CourseService,
    private logService: LogService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab === 'users' || tab === 'courses' || tab === 'logs') {
        this.currentTab = tab;
      }
    });

    this.loadUsers();
    this.loadCourses();
    this.loadLogs();
  }

  setTab(tab: 'users' | 'courses' | 'logs'): void {
    this.currentTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  loadUsers(): void {
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

  loadCourses(): void {
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

  loadLogs(): void {
    this.logService.getAllLogs().subscribe({
      next: logs => {
        this.logs = logs;
        this.logError = false;
      },
      error: err => {
        console.error('❌ Erreur chargement logs :', err);
        this.logError = true;
        this.logs = [];
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

  getTeacherName(course: Course): string {
    const teacher = course.teacherId;
    if (teacher && typeof teacher === 'object') {
      if ('name' in teacher && 'surname' in teacher) {
        return `${teacher.name} ${teacher.surname}`;
      }
    }
    return `(Prof inconnu: ${teacher})`;
  }

  isTeacherObject(value: any): value is { name: string; surname: string } {
    return typeof value === 'object' && value !== null &&
      'name' in value && 'surname' in value;
  }

  parseDetail(details: any): { email?: string; role?: string; time?: string } | null {
    try {
      const parsed = typeof details === 'string' ? JSON.parse(details) : details;
      return {
        email: parsed?.email,
        role: parsed?.role,
        time: parsed?.time
      };
    } catch (e) {
      console.warn('❗ Échec de parsing du détail du log :', details, e);
      return null;
    }
  }

  openCreateUserModal(): void {
    this.newUser = {};
    const modalEl = document.getElementById('createUserModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  createUser(): void {
    if (!this.newUser.email || !this.newUser.password || !this.newUser.role) {
      alert('Tous les champs obligatoires doivent être remplis.');
      return;
    }

    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.loadUsers();
        const modalEl = document.getElementById('createUserModal');
        if (modalEl) {
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          modalInstance?.hide();
        }
      },
      error: err => console.error('❌ Erreur création utilisateur :', err)
    });
  }
}
