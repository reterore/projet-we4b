import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  message: string | null = null;
  messageType: 'success' | 'error' | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.auth.login(this.loginForm.value).subscribe({
        next: res => {
          this.auth.setToken(res.token);
          this.message = 'Connexion réussie. Redirection...';
          this.messageType = 'success';
          setTimeout(() => this.router.navigate(['/dashboard']), 1000);
        },
        error: err => {
          this.message = err.error?.error || 'Email ou mot de passe incorrect';
          this.messageType = 'error';
        }
      });
    }
  }
}
