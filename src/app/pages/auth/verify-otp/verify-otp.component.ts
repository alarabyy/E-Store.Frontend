import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Verify2FARequest } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-verify-otp',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './verify-otp.component.html',
    styleUrls: ['./verify-otp.component.scss']
})
export class VerifyOtpComponent implements OnInit {
    otpForm: FormGroup;
    isLoading = false;
    errorMessage: string | null = null;
    email: string = '';

    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    constructor() {
        this.otpForm = this.fb.group({
            code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
        });
    }

    ngOnInit() {
        this.email = this.route.snapshot.queryParamMap.get('email') || '';
        if (!this.email) {
            // If email is missing, redirect to login
            this.router.navigate(['/auth/login']);
        }
    }

    onSubmit() {
        if (this.otpForm.invalid) {
            this.otpForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        const request: Verify2FARequest = {
            email: this.email,
            code: this.otpForm.value.code
        };

        this.authService.verify2fa(request).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                if (response.isSuccess) {
                    // Session is set in authService.verify2fa
                    this.router.navigate(['/']);
                } else {
                    this.errorMessage = response.error?.message || 'Invalid verification code';
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

    resendCode() {
        // resendOtp functionality not implemented in AuthService yet
        console.log('Resend OTP clicked for:', this.email);
        alert('Resend functionality is currently unavailable.');
    }
}
