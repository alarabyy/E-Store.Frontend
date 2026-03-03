import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/api/models/api-response.model';
import { NewsletterDashboardDataDto } from '../models/newsletter-subscription.model';

@Injectable({
    providedIn: 'root'
})
export class NewsletterDashboardService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/newsletter-dashboard/subscriptions`;

    getSubscriptions(page = 1, pageSize = 10): Observable<ApiResponse<NewsletterDashboardDataDto>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        return this.http.get<ApiResponse<NewsletterDashboardDataDto>>(this.apiUrl, { params });
    }

    unsubscribe(email: string): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${environment.apiUrl}/newsletter/unsubscribe`, { email });
    }

    // Future: Add methods for export, sending newsletters, etc.
}
