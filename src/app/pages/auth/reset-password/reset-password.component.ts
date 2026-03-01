import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResetPasswordService } from './reset-password.service';
import { ResetPasswordRequest } from './reset-password.models';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
    resetForm: FormGroup;
    isLoading = false;
    isSuccess = false;
    errorMessage: string | null = null;
    private token: string = '';
    private email: string = '';

    private fb = inject(FormBuilder);
    private resetPasswordService = inject(ResetPasswordService);
    private route = inject(ActivatedRoute);

    constructor() {
        this.resetForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit() {
        this.token = this.route.snapshot.queryParams['token'];
        this.email = this.route.snapshot.queryParams['email'];

        if (!this.token || !this.email) {
            this.errorMessage = 'Invalid password reset link.';
        }
    }

    private passwordMatchValidator(group: FormGroup) {
        const password = group.get('password')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { passwordMismatch: true };
    }

    onSubmit() {
        if (this.resetForm.invalid || !this.token || !this.email) {
            this.resetForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        const request: ResetPasswordRequest = {
            email: this.email,
            token: this.token,
            newPassword: this.resetForm.value.password
        };

        this.resetPasswordService.resetPassword(request).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                if (response.isSuccess) {
                    this.isSuccess = true;
                } else {
                    this.errorMessage = response.error?.message || 'Failed to reset password';
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
}
