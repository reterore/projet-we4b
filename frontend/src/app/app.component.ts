import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { LogService } from './services/log.service'; // ← ajout du service
import { LogEntry } from './services/log.service';   // ← interface LogEntry

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  isProf: boolean = false;
  title = 'frontend';

  // Injection de LogService
  constructor(
    private auth: AuthService,
    private router: Router,
    private logService: LogService
  ) {}

  hideNavbarRoutes = ['/login', '/register'];

  ngOnInit() {
    const user = this.auth.getUser();
    this.isProf = user?.role === 'teacher';
  }

  logout() {
    const user = this.auth.getUser();
    if (user) {
      const log: LogEntry = {
        userId: user._id,
        action: 'logout',
        details: {
          email: user.email,
          role: user.role,
          time: new Date().toISOString()
        }
      };

      this.logService.sendLog(log).subscribe({
        next: () => console.log('✅ Log de déconnexion enregistré.'),
        error: err => console.warn('⚠️ Échec d’enregistrement du log :', err),
        complete: () => {
          this.auth.logout();
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }

  shouldShowNavbar(): boolean {
    return !this.hideNavbarRoutes.includes(this.router.url);
  }
}
