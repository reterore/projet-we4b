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
  currentTab: 'users' | 'courses' | 'logs' | 'dashboard' = 'users';

  selectedAction = '';
  selectedEmail = '';
  selectedTeacherId = '';
  selectedCourseId = '';
  startDate = '';
  endDate = '';
  viewCountsByCourse: Record<string, number> = {};
  viewCountsByTeacher: Record<string, number> = {};
  timeFrameHours: number = 24;
  averageLogins: number = 0;
  filterCategory: string = 'all';
  totalLogins: number = 0;
  recentLogins: number = 0;



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
      if (tab === 'users' || tab === 'courses' || tab === 'logs' || tab === 'dashboard') {
        this.currentTab = tab;
      }
    });

    this.loadUsers();
    this.loadCourses();
    this.loadLogs();
  }

  setTab(tab: 'users' | 'courses' | 'logs' | 'dashboard'): void {
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
        this.aggregateCourseViews();
        this.aggregateTeacherViews();
      },
      error: err => {
        console.error('❌ Erreur chargement logs :', err);
        this.logError = true;
        this.logs = [];
      }
    });
  }

  aggregateCourseViews(): void {
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;
    this.viewCountsByCourse = {};

    this.logs.forEach(log => {
      if (log.action !== 'course_view') return;
      const details = this.parseDetail(log.details);
      const time = details?.time ? new Date(details.time) : null;

      if (start && time && time < start) return;
      if (end && time && time > end) return;

      const courseId = (details as any)?.courseId;
      if (courseId) {
        this.viewCountsByCourse[courseId] = (this.viewCountsByCourse[courseId] || 0) + 1;
      }
    });
  }

  aggregateTeacherViews(): void {
    this.viewCountsByTeacher = {};
    this.logs.forEach(log => {
      if (log.action !== 'course_view') return;
      const details = this.parseDetail(log.details);
      const courseId = (details as any)?.courseId;
      const course = this.courses.find(c => c._id === courseId);
      const teacherId = course?.teacherId;

      if (teacherId && typeof teacherId === 'string') {
        this.viewCountsByTeacher[teacherId] = (this.viewCountsByTeacher[teacherId] || 0) + 1;
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

  parseDetail(details: any): { email?: string; role?: string; time?: string; courseId?: string; title?: string } | null {
    try {
      const parsed = typeof details === 'string' ? JSON.parse(details) : details;
      return {
        email: parsed?.email,
        role: parsed?.role,
        time: parsed?.time,
        courseId: parsed?.courseId,
        title: parsed?.title || parsed?.title // pour être flexible
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

  calculateLoginStats(): void {
    if (!this.logs || this.logs.length === 0 || !this.startDate || !this.endDate) {
      this.averageLogins = 0;
      return;
    }

    const fromTime = new Date(this.startDate).getTime();
    const toTime = new Date(this.endDate).getTime();

    if (isNaN(fromTime) || isNaN(toTime) || fromTime > toTime) {
      console.warn('❗ Dates invalides pour le calcul des connexions.');
      this.averageLogins = 0;
      return;
    }

    // Nombre de jours complets entre les deux dates
    const days = Math.ceil((toTime - fromTime) / (1000 * 60 * 60 * 24));
    if (days <= 0) {
      this.averageLogins = 0;
      return;
    }

    const loginLogs = this.logs.filter(log => {
      const parsed = this.parseDetail(log.details);
      const logTime = parsed?.time ? new Date(parsed.time).getTime() : null;
      return log.action === 'login' && logTime !== null && logTime >= fromTime && logTime <= toTime;
    });

    this.averageLogins = loginLogs.length / days;
    this.totalLogins = loginLogs.length;
    this.averageLogins = loginLogs.length / days;
  }


  filteredLogs(): any[] {
    if (!this.logs || this.logs.length === 0) return [];

    return this.logs.filter(log => {
      const action = log.action.toLowerCase();

      switch (this.filterCategory) {
        case 'connexion':
          return action.includes('login') || action.includes('logout');
        case 'cours':
          return ['course_created', 'course_updated', 'course_deleted'].some(type => action.includes(type));
        case 'visite':
          return action.includes('visit') || action.includes('view');
        case 'all':
        default:
          return true;
      }
    });
  }

  calculateRecentLoginStats(): void {
    if (!this.logs || this.logs.length === 0 || !this.timeFrameHours) {
      this.recentLogins = 0;
      return;
    }

    const now = new Date().getTime();
    const fromTime = now - this.timeFrameHours * 60 * 60 * 1000;

    const loginLogs = this.logs.filter(log => {
      const parsed = this.parseDetail(log.details);
      const logTime = parsed?.time ? new Date(parsed.time).getTime() : null;
      return log.action === 'login' && logTime !== null && logTime >= fromTime;
    });

    this.recentLogins = loginLogs.length;
  }

}
