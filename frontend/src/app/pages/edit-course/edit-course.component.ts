import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService, Course } from 'src/app/services/course.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { LogService } from 'src/app/services/log.service';

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
  userRole: string = '';
  courseTitle: string = '';


  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private logService: LogService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    this.userRole = this.authService.getUser()?.role || '';
    this.loading = true;

    this.courseService.getCourse(this.courseId).subscribe({
      next: course => {
        this.courseTitle = course.title; // <- on stocke le titre
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

  // ✅ Mise à jour des infos du cours
  onSubmit() {
    if (this.courseForm.invalid) return;

    this.courseService.updateCourse(this.courseId, this.courseForm.value).subscribe({
      next: () => {
        const user = this.authService.getUser();
        if (user) {
          this.logService.sendLog({
            userId: user._id,
            action: 'course_updated',
            details: {
              email: user.email,
              courseId: this.courseId,
              title: this.courseForm.value.title, // <- titre modifié (form)
              updatedAt: new Date().toISOString()
            }
          }).subscribe({
            error: err => console.warn('⚠️ Erreur lors de l’envoi du log de modification', err)
          });
        }

        this.redirectAfterAction();
      },
      error: err => (this.error = 'Erreur lors de la mise à jour du cours')
    });

  }


  // ✅ Suppression avec log
  deleteCourse(): void {
    if (!confirm('❗ Voulez-vous vraiment supprimer ce cours ?')) return;

    this.courseService.deleteCourse(this.courseId).subscribe({
      next: () => {
        const user = this.authService.getUser();
        if (user) {
          this.logService.sendLog({
            userId: user._id,
            action: 'course_deleted',
            details: {
              email: user.email,
              courseId: this.courseId,
              deletedAt: new Date().toISOString(),
              title: this.courseForm.value.title
            }
          }).subscribe({
            error: err => console.warn('⚠️ Erreur lors de l’envoi du log de suppression', err)
          });
        }

        this.redirectAfterAction();
      },
      error: err => {
        console.error('❌ Erreur suppression du cours :', err);
        this.error = 'Erreur lors de la suppression du cours.';
      }
    });
  }

  // ✅ Redirection contextuelle après update/suppression
  private redirectAfterAction(): void {
    if (this.userRole === 'admin') {
      this.router.navigate(['/admin'], { queryParams: { tab: 'courses' } });
    } else if (this.userRole === 'teacher') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  cancel(): void {
    this.redirectAfterAction();
  }
}
