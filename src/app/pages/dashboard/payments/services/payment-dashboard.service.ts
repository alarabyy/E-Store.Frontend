import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { PagedResponse } from '../../newsletter/models/newsletter-subscription.model';
import { PaymentGatewayDto } from '../models/payment-gateway.model';

@Injectable({
    providedIn: 'root'
})
export class PaymentDashboardService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/payment-dashboard`;

    getGateways(page = 1, pageSize = 10): Observable<PagedResponse<PaymentGatewayDto>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        return this.http.get<PagedResponse<PaymentGatewayDto>>(`${this.apiUrl}/list`, { params });
    }

    enableGateway(id: number): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/${id}/enable`, {});
    }

    disableGateway(id: number): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/${id}/disable`, {});
    }

    createGateway(payload: any): Observable<ApiResponse<number>> {
        return this.http.post<ApiResponse<number>>(`${this.apiUrl}/create`, payload);
    }

    updateGateway(id: number, payload: any): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, payload);
    }

    setCredentials(id: number, credentials: Record<string, string>): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/${id}/credentials`, { credentials });
    }
}
