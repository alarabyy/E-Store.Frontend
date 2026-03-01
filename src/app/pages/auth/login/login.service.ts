import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse, GoogleAuthRequest } from './login.models';

import { ApiResponse } from '../../../components/models/api-response.model';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private oauthUrl = `${environment.apiUrl}/oauth`;
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
        return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, credentials);
    }

    googleAuth(data: GoogleAuthRequest): Observable<ApiResponse<LoginResponse>> {
        return this.http.post<ApiResponse<LoginResponse>>(`${this.oauthUrl}/google`, data);
    }

    // Store session after successful login
    storeSession(response: LoginResponse): void {
        this.authService.setSession(response as any);
    }
}
