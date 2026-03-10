import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginRequest, GoogleAuthRequest, AuthResponse } from '../models/auth.models';
import { TranslateModule } from '@ngx-translate/core';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { ToastService } from '../../../components/toast/services/toast.service';
import { ApiResponse } from '../../../core/api/models/api-response.model';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslateModule, GoogleSigninButtonModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    isLoading = false;
    errorMessage: string | null = null;
    showPassword = false;

    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private socialAuthService = inject(SocialAuthService);
    private toastService = inject(ToastService);

    constructor() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        });
    }

    ngOnInit() {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
        }

        this.socialAuthService.authState.subscribe((user) => {
            if (user && user.idToken) {
                this.handleGoogleLoginSuccess(user.idToken);
            }
        });
    }

    handleGoogleLoginSuccess(idToken: string) {
        this.isLoading = true;
        const request: GoogleAuthRequest = { idToken };

        this.authService.googleAuth(request).subscribe({
            next: (response: ApiResponse<AuthResponse>) => {
                this.isLoading = false;
                if (response.isSuccess && response.data) {
                    this.toastService.success('Logged in successfully with Google!');
                    this.router.navigate(['/']);
                } else {
                    this.errorMessage = response.error?.message || 'Google login failed';
                    this.toastService.error(this.errorMessage!);
                }
            },
            error: (err: any) => {
                this.isLoading = false;
                this.errorMessage = 'Google authentication error';
                this.toastService.error(this.errorMessage!);
                console.error(err);
            }
        });
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    onSubmit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        const credentials: LoginRequest = this.loginForm.value;

        this.authService.login(credentials).subscribe({
            next: (response: ApiResponse<AuthResponse>) => {
                this.isLoading = false;
                if (response.isSuccess && response.data) {
                    if (response.data.twoFactorRequired) {
                        this.router.navigate(['/auth/verify-2fa'], { queryParams: { email: credentials.email } });
                    } else {
                        // Session is already stored by AuthService.login
                        this.toastService.success('Logged in successfully!');
                        this.router.navigate(['/']);
                    }
                } else {
                    this.errorMessage = response.error?.message || 'Login failed';
                    this.toastService.error(this.errorMessage!);
                }
            },
            error: (err: any) => {
                this.isLoading = false;
                if (err.error && err.error.error && err.error.error.message) {
                    this.errorMessage = err.error.error.message;
                } else if (err.error && err.error.message) {
                    this.errorMessage = err.error.message;
                } else {
                    this.errorMessage = 'An error occurred. Please try again later.';
                }
                this.toastService.error(this.errorMessage!);
                console.error(err);
            }
        });
    }

    loginWithGoogle() {
        // Obsolete programmatic sign-in.
        // Google Identity Services (GIS) requires using the native <asl-google-signin-button>.
        // See HTML template.
    }
}
