import { Component, OnInit } from '@angular/core';
import { Course, CourseService } from 'src/app/services/course.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface User {
  _id: string;
  email: string;
  selectedCourses: string[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  courses: Course[] = [];
  userId = '6848b63e53b67a979c2c9738'; // Remplace ça par un vrai _id existant dans ta DB

  constructor(
    private courseService: CourseService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.http.get<User>(`http://localhost:3000/api/users/${this.userId}`)
      .subscribe((user: User) => {
        this.courseService.getCourses().subscribe(allCourses => {
          this.courses = allCourses.filter(course => user.selectedCourses.includes(course._id ?? ''));
        });
      });
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
