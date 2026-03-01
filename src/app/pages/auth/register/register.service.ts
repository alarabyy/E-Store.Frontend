import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RegisterRequest, RegisterResponse, GoogleAuthRequest, GoogleAuthResponse } from './register.models';

export interface ApiResponse<T> {
    isSuccess: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class RegisterService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private oauthUrl = `${environment.apiUrl}/oauth`;
    private http = inject(HttpClient);

    register(data: RegisterRequest): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/register`, data);
    }

    googleAuth(data: GoogleAuthRequest): Observable<ApiResponse<GoogleAuthResponse>> {
        return this.http.post<ApiResponse<GoogleAuthResponse>>(`${this.oauthUrl}/google`, data);
    }
}
