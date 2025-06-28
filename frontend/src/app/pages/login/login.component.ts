import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LogService } from 'src/app/services/log.service';

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
    private logService: LogService
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

    const credentials = this.loginForm.value;

    this.auth.login(credentials).subscribe({
      next: res => {
        const { token, user } = res;

        if (!token || !user?._id) {
          this.message = 'Réponse invalide du serveur.';
          this.messageType = 'error';
          return;
        }

        this.auth.setSession(token, user);
        console.log('🟢 Utilisateur connecté avec rôle :', user.role);

        this.message = 'Connexion réussie. Redirection...';
        this.messageType = 'success';

        this.logService.sendLog({
          userId: user._id,
          action: 'login',
          details: {
            email: user.email,
            role: user.role,
            time: new Date().toISOString()
          }
        }).subscribe({
          error: err => console.warn('⚠️ Échec enregistrement log', err)
        });

        setTimeout(() => {
          const role = user.role;
          if (role === 'admin') {
            this.router.navigate(['/admin']);
          } else if (role === 'teacher' || role === 'student') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/login']);
          }
        }, 500);
      },
      error: err => {
        this.message = err.error?.error || 'Email ou mot de passe incorrect.';
        this.messageType = 'error';
        console.error('❌ Erreur de login :', err);
      }
    });
  }
}
