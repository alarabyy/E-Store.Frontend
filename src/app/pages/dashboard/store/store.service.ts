import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { StoreSettings, UpdateStoreSettingsRequest, StoreDashboardSettingsResponse } from '../../../core/models/store.models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StoreService {
    private apiUrl = `${environment.apiUrl}/store-dashboard`;

    constructor(private http: HttpClient) { }

    getSettings(): Observable<ApiResponse<StoreDashboardSettingsResponse>> {
        return this.http.get<ApiResponse<StoreDashboardSettingsResponse>>(`${this.apiUrl}/settings`);
    }

    updateSettings(request: UpdateStoreSettingsRequest): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.apiUrl}/settings/edit`, request);
    }

    // Banners
    createBanner(formData: FormData): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/banners/create`, formData);
    }

    updateBanner(id: number, formData: FormData): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.apiUrl}/banners/${id}/edit`, formData);
    }

    deleteBanner(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/banners/${id}/delete`);
    }

    // Offers
    createOffer(formData: FormData): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/offers/create`, formData);
    }

    updateOffer(id: number, formData: FormData): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.apiUrl}/offers/${id}/edit`, formData);
    }

    deleteOffer(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/offers/${id}/delete`);
    }

    // Shop By Items
    createShopByItem(formData: FormData): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/shop-by-items/create`, formData);
    }

    updateShopByItem(id: number, formData: FormData): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.apiUrl}/shop-by-items/${id}/edit`, formData);
    }

    deleteShopByItem(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/shop-by-items/${id}/delete`);
    }
}
