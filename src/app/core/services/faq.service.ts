import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { FAQ, CreateFAQRequest, UpdateFAQRequest } from '../models/faq.models';
import { PagedResponse } from '../models/pagination.models';

@Injectable({
    providedIn: 'root'
})
export class FaqService {
    private apiUrl = `${environment.apiUrl}/faqs`;
    private dashboardApiUrl = `${environment.apiUrl}/faqs-dashboard`;
    private http = inject(HttpClient);

    // Public
    getFaqs(): Observable<ApiResponse<FAQ[]>> {
        return this.http.get<ApiResponse<FAQ[]>>(`${this.apiUrl}/list`);
    }

    // Dashboard
    getDashboardFaqs(page: number = 1, pageSize: number = 10): Observable<PagedResponse<FAQ>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());
        return this.http.get<PagedResponse<FAQ>>(`${this.dashboardApiUrl}/list`, { params });
    }

    createFaq(faq: CreateFAQRequest): Observable<ApiResponse<number>> {
        return this.http.post<ApiResponse<number>>(`${this.dashboardApiUrl}/create`, faq);
    }

    updateFaq(id: number, faq: UpdateFAQRequest): Observable<ApiResponse<void>> {
        return this.http.put<ApiResponse<void>>(`${this.dashboardApiUrl}/${id}`, faq);
    }

    deleteFaq(id: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.dashboardApiUrl}/${id}`);
    }

    toggleFaqStatus(id: number): Observable<ApiResponse<void>> {
        return this.http.patch<ApiResponse<void>>(`${this.dashboardApiUrl}/${id}/status`, {});
    }
}
