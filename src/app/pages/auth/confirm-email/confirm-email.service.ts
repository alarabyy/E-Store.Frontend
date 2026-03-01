import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ConfirmEmailRequest } from './confirm-email.models';

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
export class ConfirmEmailService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private http = inject(HttpClient);

    confirmEmail(data: ConfirmEmailRequest): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/confirm-email`, data);
    }
}
