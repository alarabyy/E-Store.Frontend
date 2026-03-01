import { Routes } from '@angular/router';
import { AuthLayout } from '../layouts/auth/auth.layout';

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        component: AuthLayout,
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            {
                path: 'login',
                loadComponent: () => import('../pages/auth/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'register',
                loadComponent: () => import('../pages/auth/register/register.component').then(m => m.RegisterComponent)
            },
            {
                path: 'forgot-password',
                loadComponent: () => import('../pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
            },
            {
                path: 'reset-password',
                loadComponent: () => import('../pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
            },
            {
                path: 'password-reset', // Alias for compatibility
                redirectTo: 'reset-password'
            },
            {
                path: 'verify-2fa',
                loadComponent: () => import('../pages/auth/verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent)
            },
            {
                path: 'confirm-email',
                loadComponent: () => import('../pages/auth/confirm-email/confirm-email.component').then(m => m.ConfirmEmailComponent)
            }
        ]
    }
];
