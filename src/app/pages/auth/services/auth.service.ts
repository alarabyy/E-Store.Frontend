import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../components/models/api-response.model';
import {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    Verify2FARequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ConfirmEmailRequest,
    RefreshTokenRequest,
    GoogleAuthRequest
} from '../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // API URL from environment
    private apiUrl = `${environment.apiUrl}/auth`;
    private oauthUrl = `${environment.apiUrl}/oauth`;

    private http = inject(HttpClient);
    private router = inject(Router);

    private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor() {
        // Attempt to load user from local storage on init
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                this.currentUserSubject.next(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error('Error parsing stored user:', e);
            localStorage.removeItem('currentUser');
        }
    }

    // --- Auth Endpoints ---

    login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
        return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials)
            .pipe(tap(response => {
                if (response.isSuccess && response.data && !response.data.twoFactorRequired) {
                    this.setSession(response.data);
                }
            }));
    }

    register(data: RegisterRequest): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/register`, data);
    }

    verify2fa(data: Verify2FARequest): Observable<ApiResponse<AuthResponse>> {
        return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/2fa-verify`, data)
            .pipe(tap(response => {
                if (response.isSuccess && response.data) {
                    this.setSession(response.data);
                }
            }));
    }

    confirmEmail(data: ConfirmEmailRequest): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/confirm-email`, data);
    }

    forgotPassword(data: ForgotPasswordRequest): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/forgot-password`, data);
    }

    resetPassword(data: ResetPasswordRequest): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/password-reset`, data);
    }

    changePassword(data: ChangePasswordRequest): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/change-password`, data);
    }

    refreshToken(token: string): Observable<ApiResponse<AuthResponse>> {
        const payload: RefreshTokenRequest = { token };
        return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refresh-token`, payload)
            .pipe(tap(response => {
                if (response.isSuccess && response.data) {
                    this.setSession(response.data);
                }
            }));
    }

    logout(): void {
        // Optional: Call logout endpoint
        this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
        this.clearSession();
        this.router.navigate(['/auth/login']);
    }

    // --- OAuth ---

    googleAuth(data: GoogleAuthRequest): Observable<ApiResponse<AuthResponse>> {
        return this.http.post<ApiResponse<AuthResponse>>(`${this.oauthUrl}/google`, data)
            .pipe(tap(response => {
                if (response.isSuccess && response.data && !response.data.twoFactorRequired) {
                    this.setSession(response.data);
                }
            }));
    }

    // --- Helper Methods ---

    public setSession(authResult: AuthResponse) {
        localStorage.setItem('currentUser', JSON.stringify(authResult));
        this.currentUserSubject.next(authResult);
    }

    private clearSession() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    isAuthenticated(): boolean {
        return !!this.currentUserSubject.value?.accessToken;
    }

    getToken(): string | undefined {
        return this.currentUserSubject.value?.accessToken;
    }

    get currentUserValue(): AuthResponse | null {
        return this.currentUserSubject.value;
    }

    getUserRole(): string {
        const token = this.getToken();
        if (!token) return '';
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role || payload.Role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
        } catch (e) {
            return '';
        }
    }

    getUsername(): string {
        const token = this.getToken();
        if (!token) return '';
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Try common username claims
            return payload.unique_name || payload.name || payload.sub || '';
        } catch (e) {
            return '';
        }
    }

    getUserId(): number {
        const token = this.getToken();
        if (!token) return 0;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return parseInt(payload.nameid || payload.sub || '0');
        } catch (e) {
            return 0;
        }
    }

    isAdmin(): boolean {
        const role = this.getUserRole();
        if (!role) return false;

        const lowerRole = role.toLowerCase();
        return lowerRole === 'admin' ||
            lowerRole === 'administrator' ||
            lowerRole === 'super admin' ||
            lowerRole.includes('admin'); // More permissive check
    }
}
