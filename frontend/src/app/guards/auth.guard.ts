import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('token');

    if (!token) {
      return this.router.parseUrl('/login');
    }

    // Optionnel : ici on peut ajouter une vérification du rôle ou du token JWT
    return true;
  }
}
