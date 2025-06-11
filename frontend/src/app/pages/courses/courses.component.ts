import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService, Course } from '../../services/course.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];

  constructor(private courseService: CourseService, private router: Router) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe(data => this.courses = data);
  }

  editCourse(id: string) {
    this.router.navigate(['/course-form', id]);
  }

  deleteCourse(id: string) {
    this.courseService.deleteCourse(id).subscribe(() => this.loadCourses());
  }

  addCourse() {
    this.router.navigate(['/course-form']);
  }
}
