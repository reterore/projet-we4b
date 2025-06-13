import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService, Course } from 'src/app/services/course.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/services/user.service';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  courseId: string = '';
  course: Course | null = null;
  user: User | null = null;
  isTeacher: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';

    const userId = this.authService.getUserId();
    if (userId) {
      // Charge les infos de l'utilisateur connecté
      fetch(`http://localhost:3000/api/users/${userId}`)
        .then(res => res.json())
        .then(data => {
          this.user = data;
          this.isTeacher = data.role === 'teacher';
        });
    }

    // Charge les infos du cours
    this.courseService.getCourse(this.courseId).subscribe({
      next: course => this.course = course,
      error: err => console.error('Erreur chargement cours :', err)
    });
  }
}
