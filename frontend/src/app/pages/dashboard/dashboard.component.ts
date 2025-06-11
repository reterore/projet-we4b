import { Component, OnInit } from '@angular/core';
import {Course, CourseService} from 'src/app/services/course.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  courses: Course[] = [];

  constructor(
    private courseService: CourseService,
    private router: Router  //
  ) {}
  ngOnInit(): void {
    this.getCourses();
  }


  getCourses(): void {
    this.courseService.getCourses().subscribe(
      data => this.courses = data,
      err => console.error(err)
    );
  }

  goToCreateCourse() {
    this.router.navigate(['/courses/new']);
  }

  editCourse(id: string) {
    this.router.navigate(['/courses/edit', id]);
  }

  deleteCourse(id: string) {
    this.courseService.deleteCourse(id).subscribe(() => {
      this.getCourses(); // refresh
    });
  }
}
