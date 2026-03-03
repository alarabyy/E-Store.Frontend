import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { ApiResponse } from '../../../../../../core/api/models/api-response.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ShopByItemsService {
    private apiUrl = `${environment.apiUrl}/store-dashboard/shop-by-items`;
    private http = inject(HttpClient);

    createItem(formData: FormData): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/create`, formData);
    }

    updateItem(id: number, formData: FormData): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}/edit`, formData);
    }

    deleteItem(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}/delete`);
    }
}
