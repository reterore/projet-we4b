import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

interface User {
  _id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  selectedCourses: string[];
  lastLogin?: Date;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  currentUser: User | null = null;
  isProf: boolean = false;
  error: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.auth.getUserId();

    if (!userId) {
      console.error('❌ Utilisateur non connecté.');
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<User>(`http://localhost:3000/api/users/${userId}`).subscribe({
      next: user => {
        this.currentUser = user;
        this.isProf = user.role === 'teacher';

        if (this.isProf) {
          this.loadAllUsers();
        } else {
          console.warn('🚫 Accès refusé : seuls les enseignants peuvent voir cette page.');
          this.router.navigate(['/dashboard']);
        }
      },
      error: err => {
        console.error('❌ Erreur récupération utilisateur courant :', err);
        this.router.navigate(['/login']);
      }
    });
  }

  loadAllUsers(): void {
    this.http.get<User[]>('http://localhost:3000/api/users').subscribe({
      next: users => {
        this.users = users.filter(u => u.role !== 'admin');
        this.error = false;
      },
      error: err => {
        console.error('❌ Erreur chargement utilisateurs :', err);
        this.error = true;
      }
    });
  }

  getTeachers(): User[] {
    return this.users.filter(u => u.role === 'teacher');
  }

  getStudents(): User[] {
    return this.users.filter(u => u.role === 'student');
  }
}
