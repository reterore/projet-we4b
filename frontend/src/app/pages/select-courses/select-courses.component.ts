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

  constructor(
    private courseService: CourseService,
    private auth: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(data => {
      this.courses = data;
    });
  }

  toggleSelection(courseId: string) {
    if (this.selected.has(courseId)) {
      this.selected.delete(courseId);
    } else {
      this.selected.add(courseId);
    }
  }

  saveSelection(): void {
    const userId = this.auth.getUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.http.put(`http://localhost:3000/api/users/${userId}/select-courses`, {
      selectedCourses: Array.from(this.selected)
    }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => console.error('Erreur lors de la sauvegarde', err)
    });
  }


}
