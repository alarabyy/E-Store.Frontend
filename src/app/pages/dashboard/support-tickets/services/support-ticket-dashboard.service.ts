import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../components/models/api-response.model';
import { PagedResponse, PagedRequest } from '../../../../components/models/pagination.models';
import { SupportTicketDashboardItem, TicketStatus } from '../../../public/support/models/support.model';

@Injectable({
    providedIn: 'root'
})
export class SupportTicketDashboardService {
    private apiUrl = `${environment.apiUrl}/support-tickets-dashboard`;
    private http = inject(HttpClient);

    getTickets(request: PagedRequest): Observable<PagedResponse<SupportTicketDashboardItem>> {
        let params = new HttpParams()
            .set('page', request.page.toString())
            .set('pageSize', request.pageSize.toString());

        if (request.search) {
            params = params.set('search', request.search);
        }

        return this.http.get<PagedResponse<SupportTicketDashboardItem>>(`${this.apiUrl}/list`, { params });
    }

    updateStatus(id: number, status: TicketStatus): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.apiUrl}/${id}/status`, { status });
    }

    deleteTicket(id: number): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
    }
}
