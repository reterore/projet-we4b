import { Component, OnInit } from '@angular/core';
import { CourseService, Course } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-select-courses',
  templateUrl: './select-courses.component.html',
  styleUrls: ['./select-courses.component.css']
})
export class SelectCoursesComponent implements OnInit {
  courses: Course[] = [];
  selected: Set<string> = new Set();
  isProf: boolean = false;

  constructor(
    private courseService: CourseService,
    private auth: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.auth.getUserId();

    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    // 🔁 1. Récupérer l'utilisateur et ses cours sélectionnés
    this.http.get<any>(`http://localhost:3000/api/users/${userId}`).subscribe({
      next: user => {
        this.isProf = user.role === 'teacher'; // ✅ ici
        const selectedCourses = Array.isArray(user.selectedCourses)
          ? user.selectedCourses
          : [];

        this.selected = new Set(selectedCourses);

        // 📚 2. Charger tous les cours ensuite
        this.courseService.getCourses().subscribe(data => {
          this.courses = data;
        });
      },
      error: err => {
        console.error('❌ Erreur récupération utilisateur', err);
        this.router.navigate(['/login']);
      }
    });
  }

  toggleSelection(courseId: string): void {
    if (this.isProf) return; // ⛔ Bloque les actions pour prof
    this.selected.has(courseId)
      ? this.selected.delete(courseId)
      : this.selected.add(courseId);
  }

  saveSelection(): void {
    if (this.isProf) return; // ⛔ Ne rien faire si prof

    const userId = this.auth.getUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.http.put(`http://localhost:3000/api/users/${userId}/select-courses`, {
      selectedCourses: Array.from(this.selected)
    }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => console.error('❌ Erreur lors de la sauvegarde', err)
    });
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

  ifProf(): boolean {
    return this.isProf;
  }
}
