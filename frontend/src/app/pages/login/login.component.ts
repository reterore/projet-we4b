import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LogService } from 'src/app/services/log.service'; // 👈 Ajout

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  message: string | null = null;
  messageType: 'success' | 'error' | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private logService: LogService // 👈 Injection du service de log
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.message = 'Tous les champs sont requis.';
      this.messageType = 'error';
      return;
    }

    this.auth.login(this.loginForm.value).subscribe({
      next: res => {
        this.auth.setSession(res.token, res.user);
        console.log('🟢 Utilisateur connecté avec rôle :', res.user.role);

        this.message = 'Connexion réussie. Redirection...';
        this.messageType = 'success';

        // 📝 Enregistrement du log de connexion
        this.logService.sendLog({
          userId: res.user._id,
          action: 'login_success',
          details: {
            email: res.user.email,
            role: res.user.role,
            time: new Date().toISOString()
          }
        }).subscribe({
          error: err => console.warn('⚠️ Échec enregistrement log', err)
        });

        setTimeout(() => {
          switch (res.user.role) {
            case 'admin':
              this.router.navigate(['/admin']);
              break;
            case 'teacher':
            case 'student':
              this.router.navigate(['/dashboard']);
              break;
            default:
              this.router.navigate(['/login']);
              break;
          }
        }, 500);
      },
      error: err => {
        this.message = err.error?.error || 'Email ou mot de passe incorrect';
        this.messageType = 'error';
        console.error('❌ Erreur de login :', err);
      }
    });
  }
}
