import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { CourseService, Course } from 'src/app/services/course.service';
import { Router } from '@angular/router';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  courses: Course[] = [];
  currentTab: 'users' | 'courses' = 'users';

  userError: boolean = false;
  courseError: boolean = false;

  constructor(
    private userService: UserService,
    private courseService: CourseService,
    private auth: AuthService,
    private router: Router
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
    this.courseService.getCourses().subscribe({
      next: (courses: Course[]) => {
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

  logout() {
    this.auth.logout(); // ou authService.logout();
    this.router.navigate(['/login']);
  }
}
