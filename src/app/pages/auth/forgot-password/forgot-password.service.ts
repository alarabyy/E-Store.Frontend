import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ForgotPasswordRequest } from './forgot-password.models';

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
export class ForgotPasswordService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private http = inject(HttpClient);

    forgotPassword(data: ForgotPasswordRequest): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/forgot-password`, data);
    }
}
