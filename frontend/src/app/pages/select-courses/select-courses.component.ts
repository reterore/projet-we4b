import { Component, OnInit } from '@angular/core';
import { Course, CourseService } from 'src/app/services/course.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-courses',
  templateUrl: './select-courses.component.html',
})
export class SelectCoursesComponent implements OnInit {
  courses: Course[] = [];
  selected: string[] = [];
  userId = 'ID_DU_USER_CONNECTE'; // À remplacer dynamiquement si vous utilisez une auth

  constructor(private courseService: CourseService, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(data => {
      this.courses = data;
    });
  }

  toggleSelection(courseId: string): void {
    if (this.selected.includes(courseId)) {
      this.selected = this.selected.filter(id => id !== courseId);
    } else {
      this.selected.push(courseId);
    }
  }

  saveCourses(): void {
    this.http.put(`http://localhost:3000/api/users/${this.userId}/select-courses`, {
      courseIds: this.selected
    }).subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }
}
