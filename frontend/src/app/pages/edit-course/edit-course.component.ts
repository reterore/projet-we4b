import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService, Course } from 'src/app/services/course.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-course',
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.css']
})
export class EditCourseComponent implements OnInit {
  courseForm!: FormGroup;
  courseId!: string;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    this.loading = true;
    this.courseService.getCourse(this.courseId).subscribe({
      next: course => {
        this.courseForm = this.fb.group({
          title: [course.title, Validators.required],
          description: [course.description, Validators.required],
          teacherId: [course.teacherId, Validators.required]
        });
        this.loading = false;
      },
      error: err => {
        this.error = 'Cours introuvable';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.courseForm.invalid) return;

    this.courseService.updateCourse(this.courseId, this.courseForm.value).subscribe({
      next: () => this.router.navigate(['/admin'], { queryParams: { tab: 'courses' } }),
      error: err => (this.error = 'Erreur lors de la mise à jour du cours')
    });
  }

  cancel(): void {
    this.router.navigate(['/admin'], { queryParams: { tab: 'courses' } });
  }
}
