import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { ApiResponse } from '../../../../../../core/models/api-response.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ExclusiveOffersService {
    private apiUrl = `${environment.apiUrl}/store-dashboard/offers`;
    private http = inject(HttpClient);

    createOffer(formData: FormData): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/create`, formData);
    }

    updateOffer(id: number, formData: FormData): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}/edit`, formData);
    }

    deleteOffer(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}/delete`);
    }
}
