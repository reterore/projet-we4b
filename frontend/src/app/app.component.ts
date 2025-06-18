import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  isProf: boolean = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const user = this.auth.getUser();
    this.isProf = user?.role === 'teacher';
  }

  hideNavbarRoutes = ['/login', '/register'];

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  shouldShowNavbar(): boolean {
    return !this.hideNavbarRoutes.includes(this.router.url);
  }
}
