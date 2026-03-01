import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfirmEmailService } from './confirm-email.service';
import { ConfirmEmailRequest } from './confirm-email.models';

@Component({
    selector: 'app-confirm-email',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        <div class="auth-card animate-slide-up">
            <div class="status-icon" [class.success]="isSuccess" [class.error]="isError">
                <i *ngIf="isLoading" class="ri-loader-4-line spin"></i>
                <i *ngIf="isSuccess" class="ri-checkbox-circle-line"></i>
                <i *ngIf="isError" class="ri-error-warning-line"></i>
            </div>
            
            <div class="content">
                <h1 *ngIf="isLoading">Verifying Email...</h1>
                <h1 *ngIf="isSuccess">Email Verified!</h1>
                <h1 *ngIf="isError">Verification Failed</h1>
                
                <p *ngIf="message">{{ message }}</p>
                
                <a *ngIf="!isLoading" routerLink="/auth/login" class="btn-primary mt-4">
                    Login Now
                </a>
            </div>
        </div>
    `,
    styles: [`
        .auth-card {
            background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 24px;
            padding: 3rem 2rem; width: 100%; text-align: center; color: #0f172a;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }
        .status-icon { font-size: 4rem; margin-bottom: 1.5rem; color: #3b82f6; }
        .status-icon.success { color: #22c55e; }
        .status-icon.error { color: #ef4444; }
        .spin { animation: spin 1s linear infinite; display: inline-block; }
        @keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }
        h1 { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; }
        p { color: #64748b; }
        .btn-primary {
            display: inline-block; width: 100%; padding: 1rem;
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            color: white; text-decoration: none; border-radius: 12px; font-weight: 700;
            margin-top: 2rem; border: none; cursor: pointer; transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4); }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    `]
})
export class ConfirmEmailComponent implements OnInit {
    isLoading = true;
    isSuccess = false;
    isError = false;
    message = '';

    private route = inject(ActivatedRoute);
    private confirmEmailService = inject(ConfirmEmailService);

    ngOnInit() {
        const token = this.route.snapshot.queryParams['token'];
        const email = this.route.snapshot.queryParams['email'];

        if (token && email) {
            const request: ConfirmEmailRequest = { email, token };
            this.confirmEmailService.confirmEmail(request).subscribe({
                next: (res: any) => {
                    this.isLoading = false;
                    if (res.isSuccess) {
                        this.isSuccess = true;
                    } else {
                        this.isError = true;
                        this.message = res.error?.message || 'Verification failed.';
                    }
                },
                error: () => {
                    this.isLoading = false;
                    this.isError = true;
                    this.message = 'An error occurred during verification.';
                }
            });
        } else {
            this.isLoading = false;
            this.isError = true;
            this.message = 'Invalid verification link.';
        }
    }
}
