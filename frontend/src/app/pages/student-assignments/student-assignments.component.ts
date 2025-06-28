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
  groupedSubmissions: {
    courseTitle: string;
    submissions: {
      assignmentTitle: string;
      comment: string | null;
      grade: number | null;
    }[];
    average: number | null;
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
        const courseMap: Record<string, {
          courseTitle: string,
          submissions: { assignmentTitle: string; comment: string | null; grade: number | null }[]
        }> = {};

        summaries.forEach(s => {
          if (!courseMap[s.courseTitle]) {
            courseMap[s.courseTitle] = { courseTitle: s.courseTitle, submissions: [] };
          }

          courseMap[s.courseTitle].submissions.push({
            assignmentTitle: s.title,
            comment: s.submission?.comment ?? null,
            grade: s.submission?.grade ?? null
          });
        });

        this.groupedSubmissions = Object.values(courseMap).map(group => {
          const graded = group.submissions.filter(s => s.grade !== null);
          const average = graded.length > 0
            ? +(graded.reduce((sum, s) => sum + (s.grade ?? 0), 0) / graded.length).toFixed(2)
            : null;

          return { ...group, average };
        });
      },
      error: err => console.error('Erreur chargement devoirs :', err)
    });
  }

  // to go back after checking the grade
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
