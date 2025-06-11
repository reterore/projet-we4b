import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<{ token: string, user: any }>(`${this.apiUrl}/login`, credentials);
  }

  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  setSession(token: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user._id);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
