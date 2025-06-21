import {Component, OnInit} from '@angular/core';
import {Course, CourseService} from 'src/app/services/course.service';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {AuthService} from 'src/app/services/auth.service';
import {LogService} from 'src/app/services/log.service';
import {ContentService} from 'src/app/services/content.service';

interface User {
  _id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  selectedCourses: string[];
}

interface Module {
  _id: string;
  title: string;
  courseId: string;
  contents: { _id: string; title: string; type: string }[];
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
  title = '';
  courseDescription = '';
  courseProgressMap: Record<string, number> = {};
  modules: Module[] = [];
  courseContentCount: Record<string, number> = {};
  courseModuleCompletionMap: Record<string, number> = {};
  viewedMap: Record<string, boolean> = {};
  totalViewedContents = 0;

  constructor(
    private courseService: CourseService,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService,
    private logService: LogService,
    private contentService: ContentService
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

          this.http.get<Module[]>('http://localhost:3000/api/modules').subscribe({
            next: mods => {
              this.modules = mods;

              const promises: Promise<void>[] = [];

              this.courses.forEach(course => {
                const courseModules = mods.filter(m => m.courseId === course._id);

                this.courseContentCount[course._id!] = courseModules.reduce((sum, m) => sum + (m.contents?.length || 0), 0);

                promises.push(
                  ...courseModules.map(m =>
                    Promise.all(
                      m.contents.map(c =>
                        this.contentService.isContentViewed(user._id, c._id).toPromise()
                          .then(res => {
                            if (res && typeof res.isViewed === 'boolean') {
                              this.viewedMap[c._id] = res.isViewed;
                            } else {
                              console.warn(`⚠️ Réponse inattendue pour contenu ${c._id} :`, res);
                            }
                          })
                          .catch(err => console.warn(`⚠️ Erreur vue pour contenu ${c._id} :`, err))
                      )
                    ).then(() => {
                      const viewed = this.getViewedCount(m);
                      const total = m.contents?.length || 0;
                      if (total > 0 && viewed === total) {
                        if (!this.courseModuleCompletionMap[course._id!]) {
                          this.courseModuleCompletionMap[course._id!] = 0;
                        }
                        this.courseModuleCompletionMap[course._id!]++;
                      }
                    })
                  )
                );
              });

              Promise.all(promises).then(() => {
                this.courses.forEach(course => {
                  const modules = this.modules.filter(m => m.courseId === course._id);
                  const count = modules.length;
                  const completed = this.courseModuleCompletionMap[course._id!] || 0;
                  this.courseModuleCompletionMap[course._id!] = count > 0 ? Math.round((completed / count) * 100) : 0;
                });

                this.totalViewedContents = mods.reduce((sum, m) => sum + this.getViewedCount(m), 0);
              });
            },
            error: err => console.error('❌ Erreur chargement modules :', err)
          });
        });

        if (this.isProf) {
          this.http.get<User[]>(`http://localhost:3000/api/users`).subscribe({
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

  getCourseProgress(courseId: string): number {
    const total = this.getCourseContentCount(courseId);
    const viewed = this.getCourseViewedCount(courseId);
    if (total === 0) return 0;
    return Math.round((viewed / total) * 100);
  }

  getCourseContentCount(courseId?: string): number {
    if (!courseId) return 0;
    return this.courseContentCount[courseId] ?? 0;
  }

  getCourseModuleCompletion(courseId?: string): number {
    if (!courseId) return 0;
    return this.courseModuleCompletionMap[courseId] ?? 0;
  }

  getViewedCount(module: Module): number {
    if (!module?.contents?.length) return 0;
    return module.contents.filter(c => !!this.viewedMap[c._id]).length;
  }

  getCourseViewedCount(courseId: string): number {
    const courseModules = this.modules.filter(m => m.courseId === courseId);
    return courseModules.reduce((sum, m) => sum + this.getViewedCount(m), 0);
  }

}
