import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService, Course } from '../../services/course.service';

@Component({
  selector: 'app-course-form',
  templateUrl: './course-form.component.html',
})
export class CourseFormComponent implements OnInit {
  course: Course = { title: '', description: '', teacherId: '' };
  isEditMode = false;

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.courseService.getCourse(id).subscribe(c => this.course = c);
    }
  }

  saveCourse() {
    if (this.isEditMode) {
      this.courseService.updateCourse(this.course._id!, this.course).subscribe(() => {
        this.router.navigate(['/courses']);
      });
    } else {
      this.courseService.createCourse(this.course).subscribe(() => {
        this.router.navigate(['/courses']);
      });
    }
  }
}
