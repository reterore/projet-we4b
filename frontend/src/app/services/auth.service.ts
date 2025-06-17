import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  // 🔐 Envoi de la requête de login
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials);
  }

  // 📝 Envoi de la requête d'inscription
  register(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  // 💾 Sauvegarde les infos utilisateur dans le localStorage
  setSession(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', user.role); // ← indispensable pour le guard
  }

  // 🔓 Supprime la session utilisateur
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ✅ Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // 🔍 Récupère les infos utilisateur
  getUser(): any | null {
    const user = localStorage.getItem('user');
    try {
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('❌ Erreur parsing user :', e);
      return null;
    }
  }

  // 🔍 Récupère le rôle de l'utilisateur
  getUserRole(): string | null {
    return this.getUser()?.role || null;
  }

  // 🔍 Récupère l'ID utilisateur
  getUserId(): string | null {
    return this.getUser()?._id || null;
  }

  // 🔐 Récupère le token JWT
  getToken(): string | null {
    return localStorage.getItem('token');
  }


}
