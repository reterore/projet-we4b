import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); // tu dois avoir stocké ça après login

    console.log('AuthGuard - token =', token);
    console.log('AuthGuard - role =', role);

    // 1. Aucun token → redirection login
    if (!token) {
      console.warn('❌ Accès refusé : aucun token');
      return this.router.parseUrl('/login');
    }

    // 2. Route vers /admin → check du rôle
    const isAdminRoute = route.routeConfig?.path === 'admin';
    if (isAdminRoute && role !== 'admin') {
      console.warn('❌ Accès refusé : rôle insuffisant pour /admin');
      return this.router.parseUrl('/dashboard'); // ou une autre page d’accueil
    }

    console.log('✅ AuthGuard : accès autorisé');
    return true;
  }
}
