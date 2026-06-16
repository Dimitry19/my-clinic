import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Authenticate, User } from '../../../core/models/auth/auth.model';
import { CommonService } from '../../../core/services/common.services';
import { ApiResponse } from '../../../core/models/response/api-response.model';
import { LoginStep, ErrorType } from '../../../core/models/all/all.model';

@Component({
  selector: 'clnt-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  currentYear: number = new Date().getFullYear();
  private fb = inject(FormBuilder);

  private router = inject(Router);

  private authService = inject(AuthService);
  private commonService = inject(CommonService);

  step = signal<LoginStep>('idle');
  errorType = signal<ErrorType>(null);
  errorMsg = signal('');
  attempts = signal(0);
  showPwd = signal(false);
  capsLock = signal(false);

  readonly MAX_ATTEMPTS = 5;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  // ── Getters erreurs champ ──────────────────────────────
  get emailCtrl() {
    return this.form.get('email')!;
  }
  get passwordCtrl() {
    return this.form.get('password')!;
  }

  get emailError(): string {
    const c = this.emailCtrl;
    if (!c.dirty && !c.touched) return '';
    if (c.errors?.['required']) return "L'adresse email est obligatoire.";
    if (c.errors?.['email'])
      return "Format d'email invalide (ex: nom@domaine.com).";
    return '';
  }

  get passwordError(): string {
    const c = this.passwordCtrl;
    if (!c.dirty && !c.touched) return '';
    if (c.errors?.['required']) return 'Le mot de passe est obligatoire.';
    if (c.errors?.['minlength'])
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    return '';
  }

  get isLocked(): boolean {
    return this.attempts() >= this.MAX_ATTEMPTS;
  }
  get attemptsLeft(): number {
    return this.MAX_ATTEMPTS - this.attempts();
  }

  // ── CapsLock detection ────────────────────────────────
  onKeyEvent(e: KeyboardEvent) {
    this.capsLock.set(e.getModifierState?.('CapsLock') ?? false);
  }

  // ── Soumission ────────────────────────────────────────
  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isLocked) return;

    this.step.set('loading');
    this.errorType.set(null);
    this.errorMsg.set('');

    const { email, password } = this.form.value;
    const credentials = { email, password } as Authenticate;

    this.authService.login(credentials).subscribe({
      next: (response: ApiResponse<User>) => {
        if (this.commonService.isSuccessResponse(response)) {
          const user = response.data;
          this.authService.setUser(user);
          this.step.set('success');
          setTimeout(() => this.router.navigate(['/dashboard']), 800);
        } else {
          this.step.set('error');
          const newAttempts = this.attempts() + 1;
          this.attempts.set(newAttempts);
          this.errorType.set('network');
          this.errorMsg.set(
            response.message ??
              'Une erreur est survenue. Réessayez dans quelques instants.',
          );
        }
      },
      error: (err) => {
        this.step.set('error');
        const newAttempts = this.attempts() + 1;
        this.attempts.set(newAttempts);

        const status = err?.status;
        if (status === 401) {
          this.errorType.set('credentials');
          this.errorMsg.set(
            newAttempts >= this.MAX_ATTEMPTS
              ? "Compte temporairement verrouillé. Contactez l'administrateur."
              : `Email ou mot de passe incorrect. Il vous reste ${this.MAX_ATTEMPTS - newAttempts} tentative(s).`,
          );
          this.passwordCtrl.reset();
        } else if (status === 403) {
          this.errorType.set('locked');
          this.errorMsg.set(
            "Votre compte a été désactivé. Contactez l'administrateur.",
          );
        } else if (status === 0 || status === 503) {
          this.errorType.set('network');
          this.errorMsg.set(
            'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
          );
        } else if (status >= 500) {
          this.errorType.set('server');
          this.errorMsg.set(
            'Une erreur serveur est survenue. Réessayez dans quelques instants.',
          );
        } else {
          this.errorType.set('server');
          this.errorMsg.set(
            err?.error?.message ?? 'Une erreur inattendue est survenue.',
          );
        }
      },
    });
  }

  reinitialiser() {
    this.form.reset();
    this.step.set('idle');
    this.errorType.set(null);
    this.errorMsg.set('');
    this.attempts.set(0);
  }
}
