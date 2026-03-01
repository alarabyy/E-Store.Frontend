import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ForgotPasswordService } from './forgot-password.service';
import { ForgotPasswordRequest } from './forgot-password.models';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
    forgotForm: FormGroup;
    isLoading = false;
    isSuccess = false;
    errorMessage: string | null = null;

    private fb = inject(FormBuilder);
    private forgotPasswordService = inject(ForgotPasswordService);

    constructor() {
        this.forgotForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit() {
        if (this.forgotForm.invalid) {
            this.forgotForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        const request: ForgotPasswordRequest = { email: this.forgotForm.value.email };
        this.forgotPasswordService.forgotPassword(request).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                if (response.isSuccess) {
                    this.isSuccess = true;
                } else {
                    this.errorMessage = response.error?.message || 'Failed to send reset link';
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
