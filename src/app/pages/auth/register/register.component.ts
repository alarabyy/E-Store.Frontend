import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterRequest, GoogleAuthRequest } from '../models/auth.models';
import { TranslateModule } from '@ngx-translate/core';
import { SocialAuthService, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslateModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    isLoading = false;
    errorMessage: string | null = null;
    showPassword = false;
    showConfirmPassword = false;

    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private socialAuthService = inject(SocialAuthService);

    constructor() {
        this.registerForm = this.fb.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            username: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]],
            isOrganization: [false]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit() {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
        }
    }

    private passwordMatchValidator(group: FormGroup) {
        const password = group.get('password')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { passwordMismatch: true };
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPassword() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onSubmit() {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        // Remove confirmPassword before sending to backend
        const { confirmPassword, ...registerData } = this.registerForm.value;
        const request: RegisterRequest = registerData;

        this.authService.register(request).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                if (response.isSuccess) {
                    this.router.navigate(['/auth/login'], { queryParams: { registered: true } });
                } else {
                    this.errorMessage = response.error?.message || 'Registration failed';
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
                console.error(err);
            }
        });
    }

    loginWithGoogle() {
        this.isLoading = true;
        this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then(user => {
            const request: GoogleAuthRequest = {
                idToken: user.idToken || ''
            };
            this.authService.googleAuth(request).subscribe({
                next: (response: any) => {
                    this.isLoading = false;
                    if (response.isSuccess) {
                        this.router.navigate(['/dashboard']);
                    } else {
                        // if response.isSuccess is false, show error
                        this.errorMessage = response.error?.message || 'Google login failed';
                    }
                },
                error: (err: any) => {
                    this.isLoading = false;
                    this.errorMessage = 'Google authentication error';
                    console.error(err);
                }
            });
        }).catch(err => {
            this.isLoading = false;
            console.error('Google Social Error:', err);
        });
    }
}
