import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService, Course } from 'src/app/services/course.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import {LogEntry, LogService} from 'src/app/services/log.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-course',
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.css']
})
export class CreateCourseComponent implements OnInit {
  courseForm!: FormGroup;
  teacherId!: string;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private logService: LogService
  ) {
  }

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (!user || user.role !== 'teacher') {
      console.warn('Accès refusé : seuls les enseignants peuvent créer un cours.');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.teacherId = user._id;

    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });

  }

  onSubmit(): void {
    if (this.courseForm.invalid) return;

    const courseData: Course = {
      ...this.courseForm.value,
      teacherId: this.teacherId
    };

    this.courseService.createCourse(courseData).subscribe({
      next: (createdCourse) => {
        if (!createdCourse._id) {
          console.error('❌ ID du cours manquant après création');
          return;
        }

        // ✅ Log de création du cours
        const user = this.auth.getUser();
        if (user) {
          const logEntry: LogEntry = {
            userId: user._id,
            action: 'course_created',
            details: {
              courseId: createdCourse._id,
              title: createdCourse.title,
              email: user.email,
              teacherName: `${user.name} ${user.surname}`,
              time: new Date().toISOString()
            }
          };

          this.logService.sendLog(logEntry).subscribe({
            error: err => console.warn('⚠️ Erreur envoi log création cours :', err)
          });
        }

        // 🔗 Associer le cours au prof
        this.userService.appendCourseToUser(this.teacherId, createdCourse._id).subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: err => console.error('❌ Erreur ajout cours à l\'enseignant :', err)
        });
      },
      error: err => console.error('❌ Erreur création cours :', err)
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
