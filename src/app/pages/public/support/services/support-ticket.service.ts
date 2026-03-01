import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../components/models/api-response.model';
import { CreateSupportTicketRequest } from '../models/support.model';

@Injectable({
    providedIn: 'root'
})
export class SupportTicketService {
    private apiUrl = `${environment.apiUrl}/support-tickets`;
    private http = inject(HttpClient);

    createTicket(request: CreateSupportTicketRequest): Observable<ApiResponse<string>> {
        return this.http.post<ApiResponse<string>>(`${this.apiUrl}/create`, request);
    }
}
