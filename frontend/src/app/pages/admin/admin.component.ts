import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/UserService';
import { CourseService } from '../../services/CourseService';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  courses: any[] = [];
  currentTab: 'users' | 'courses' = 'users';

  userError: boolean = false;
  courseError: boolean = false;

  constructor(
    private userService: UserService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadCourses();
  }

  setTab(tab: 'users' | 'courses') {
    this.currentTab = tab;
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users: any[]) => {
        console.log('✔️ Utilisateurs reçus :', users);
        this.users = users;
        this.userError = false;
      },
      error: err => {
        console.error('❌ Erreur lors du chargement des utilisateurs :', err);
        this.userError = true;
        this.users = [];
      }
    });
  }


  loadCourses() {
    this.courseService.getAllCourses().subscribe({
      next: (courses: any[]) => {
        this.courses = courses;
        this.courseError = false;
      },
      error: err => {
        console.error('Erreur lors du chargement des cours :', err);
        this.courseError = true;
        this.courses = [];
      }
    });
  }
}
