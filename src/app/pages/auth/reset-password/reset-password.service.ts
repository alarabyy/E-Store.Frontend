import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ResetPasswordRequest } from './reset-password.models';

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
export class ResetPasswordService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private http = inject(HttpClient);

    resetPassword(data: ResetPasswordRequest): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/password-reset`, data);
    }
}
