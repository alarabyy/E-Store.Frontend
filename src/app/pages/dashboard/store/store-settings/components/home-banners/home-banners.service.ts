import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { ApiResponse } from '../../../../../../core/api/models/api-response.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HomeBannersService {
    private apiUrl = `${environment.apiUrl}/store-dashboard/banners`;
    private http = inject(HttpClient);

    createBanner(formData: FormData): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/create`, formData);
    }

    updateBanner(id: number, formData: FormData): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}/edit`, formData);
    }

    deleteBanner(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}/delete`);
    }
}
