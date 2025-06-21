import { Component, OnInit } from '@angular/core';
import {AssignmentService, AssignmentSummary} from 'src/app/services/assignment.service';
import { CourseService } from 'src/app/services/course.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-assignments',
  templateUrl: './student-assignments.component.html',
  styleUrls: ['./student-assignments.component.css']
})
export class StudentAssignmentsComponent implements OnInit {
  submissions: {
    courseTitle: string;
    assignmentTitle: string;
    comment: string | null;
    grade: number | null;
  }[] = [];

  constructor(
    private assignmentService: AssignmentService,
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const user = this.authService.getUser();
    if (!user || user.role !== 'student') return;

    this.assignmentService.getAssignmentsByStudent(user._id).subscribe({
      next: (summaries: AssignmentSummary[]) => {
        this.submissions = summaries.map(s => ({
          courseTitle: s.courseTitle,
          assignmentTitle: s.title,
          grade: s.submission?.grade ?? null,
          comment: s.submission?.comment ?? null
        }));
      },
      error: err => console.error('Erreur chargement devoirs :', err)
    });

  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
