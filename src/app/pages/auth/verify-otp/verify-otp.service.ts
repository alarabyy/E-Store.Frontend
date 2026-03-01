import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Verify2FARequest, Verify2FAResponse } from './verify-otp.models';

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
export class VerifyOtpService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private http = inject(HttpClient);

    verify2FA(data: Verify2FARequest): Observable<ApiResponse<Verify2FAResponse>> {
        return this.http.post<ApiResponse<Verify2FAResponse>>(`${this.apiUrl}/2fa-verify`, data);
    }

    // Store session after successful verification
    storeSession(response: Verify2FAResponse): void {
        localStorage.setItem('currentUser', JSON.stringify(response));
    }
}
