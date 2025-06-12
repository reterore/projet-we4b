import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  message: string | null = null;
  messageType: 'success' | 'error' | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['student', Validators.required]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.message = 'Veuillez remplir correctement tous les champs.';
      this.messageType = 'error';
      return;
    }

    const { confirmPassword, ...data } = this.registerForm.value;

    this.auth.register(data).subscribe({
      next: () => {
        this.message = 'Inscription réussie ! Redirection vers la connexion...';
        this.messageType = 'success';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: err => {
        this.message = err.error?.error || 'Erreur lors de l’inscription';
        this.messageType = 'error';
      }
    });
  }
}
