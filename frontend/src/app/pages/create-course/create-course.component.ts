import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService, Course } from 'src/app/services/course.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
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
    private router: Router
  ) {}

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

        // 🔗 Ajouter le cours à la liste de l'enseignant (sans écraser les autres)
        this.userService.appendCourseToUser(this.teacherId, createdCourse._id).subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: err => console.error('❌ Erreur ajout cours à l\'enseignant :', err)
        });
      },
      error: err => console.error('❌ Erreur création cours :', err)
    });
  }
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
