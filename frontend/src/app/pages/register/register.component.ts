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

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  // Validation des mots de passe
  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }



  // Soumission du formulaire
  onSubmit(): void {
    console.log('🔍 Form values:', this.registerForm.value);
    console.log('🔍 Form status:', this.registerForm.status);
    console.log('🔍 Form errors:', this.registerForm.errors);
    Object.entries(this.registerForm.controls).forEach(([key, control]) => {
      console.log(`🔍 ${key} → valid=${control.valid} | value=`, control.value, '| errors=', control.errors);
    });
    if (this.registerForm.invalid) {
      if (this.registerForm.errors?.['passwordMismatch']) {
        this.message = 'Les mots de passe ne correspondent pas.';
      } else {
        const invalidFields = Object.keys(this.registerForm.controls)
          .filter(k => this.registerForm.controls[k].invalid);
        this.message = `Le formulaire contient ${invalidFields.length} champ(s) invalide(s).`;
      }
      this.messageType = 'error';
      return;
    }

    // On retire confirmPassword et on prépare les données à envoyer
    const { confirmPassword, ...payload } = this.registerForm.value;

    this.auth.register(payload).subscribe({
      next: () => {
        this.message = 'Inscription réussie ! Redirection vers la connexion...';
        this.messageType = 'success';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: err => {
        this.message = err.error?.error || 'Erreur lors de l’inscription.';
        this.messageType = 'error';
      }
    });
  }
}
