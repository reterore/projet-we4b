import { Component, OnInit } from '@angular/core';
import { AssignmentService} from 'src/app/services/assignment.service';
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
    moduleTitle?: string;
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
      next: summaries => {
        this.submissions = summaries.map(s => ({
          courseTitle: s.courseTitle,
          assignmentTitle: s.title,
          moduleTitle: s.moduleTitle,
          grade: s.submission?.grade ?? null
        }));

        console.log("🎯 Submissions finales :", this.submissions);
      },
      error: err => console.error('Erreur chargement devoirs :', err)
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
