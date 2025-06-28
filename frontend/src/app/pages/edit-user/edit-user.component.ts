import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, User } from 'src/app/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  userForm!: FormGroup;
  userId!: string;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.loading = true;

    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        this.userForm = this.fb.group({
          name: [user.name, Validators.required],
          surname: [user.surname, Validators.required],
          email: [{ value: user.email, disabled: true }, [Validators.required, Validators.email]],
          role: [user.role, Validators.required],
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Utilisateur introuvable';
        this.loading = false;
        this.router.navigate(['/admin']);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    const updatedUser = this.userForm.getRawValue();
    this.userService.updateUser(this.userId, updatedUser).subscribe({
      next: () => this.router.navigate(['/admin']),
      error: (err) => {
        console.error('❌ Erreur mise à jour utilisateur :', err);
        this.error = 'Erreur lors de la mise à jour';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin']);
  }
}
