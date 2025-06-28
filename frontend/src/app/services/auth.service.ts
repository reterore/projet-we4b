import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  setSession(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', user.role); // ← indispensable pour le guard
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getUser(): any | null {
    const user = localStorage.getItem('user');
    try {
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('❌ Erreur parsing user :', e);
      return null;
    }
  }

  getUserId(): string | null {
    return this.getUser()?._id || null;
  }
}
