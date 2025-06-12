import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('token');
    console.log('AuthGuard - token =', token);

    if (!token) {
      console.log('Pas de token → redirection vers /login');
      return this.router.parseUrl('/login');
    }

    console.log('Token présent → accès autorisé');
    return true;
  }

}

