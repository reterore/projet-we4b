import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService, Course } from 'src/app/services/course.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';


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
    private router: Router,
    private authService: AuthService

) {}
  userRole: string = '';
  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    this.userRole = this.authService.getUser()?.role || '';
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
      next: () => {
        if (this.userRole === 'admin') {
          this.router.navigate(['/admin'], { queryParams: { tab: 'courses' } });
        } else if (this.userRole === 'teacher') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/']); // sécurité : retour accueil pour rôle inconnu
        }
      },
      error: err => (this.error = 'Erreur lors de la mise à jour du cours')
    });
  }

  cancel(): void {
    this.router.navigate(['/admin'], { queryParams: { tab: 'courses' } });
  }
}
