import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Authenticate, User } from '../../../core/models/auth/auth.model';
import { CommonService } from '../../../core/services/common.services';
import { ApiResponse } from '../../../core/models/response/api-response.model';

@Component({
  selector: 'clnt-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  private router = inject(Router);
  protected fb = inject(FormBuilder);
  protected authService = inject(AuthService);
  protected commonService = inject(CommonService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;
    const credentials = { email, password } as Authenticate;
    this.authService.login(credentials).subscribe({
      next: (response: ApiResponse<User>) => {
        if (this.commonService.isSuccessResponse(response)) {
          const user = response.data;
          this.authService.setUser(user);

          this.router.navigate(['/patients']);
        } else {
          this.router.navigate(['/unauthorized']);
        }
      },
      error: (err) => {
        this.errorMessage =
          err?.message ?? 'clinic.message.error.auth.credentials';

        this.isLoading = false;
        this.router.navigate(['/unauthorized']);
      },
      complete: () => (this.isLoading = false),
    });
  }
}
