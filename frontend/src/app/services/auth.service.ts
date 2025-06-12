import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  // 🔐 Requête de connexion
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials);
  }

  // 📝 Requête d'inscription
  register(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  // 💾 Enregistre le token et l'utilisateur dans le localStorage
  setSession(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // 🔐 Récupère le token JWT
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // 🔍 Récupère l'utilisateur courant
  getUser(): any | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserId(): string | null {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?._id || null;
  }

  // 👤 Récupère le rôle de l'utilisateur
  getUserRole(): string | null {
    const user = this.getUser();
    return user?.role || null;
  }

  // 🔓 Déconnexion (nettoie le stockage local)
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ✅ Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
