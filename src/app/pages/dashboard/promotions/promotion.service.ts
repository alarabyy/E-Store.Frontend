import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Promotion, CreatePromotionRequest, UpdatePromotionRequest } from './promotion.models';
import { ApiResponse } from '../../../core/api/models/api-response.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PromotionService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/promotions-dashboard`;

    getPromotions(): Observable<ApiResponse<Promotion[]>> {
        return this.http.get<ApiResponse<Promotion[]>>(`${this.apiUrl}/list`);
    }

    getPromotionById(id: number): Observable<ApiResponse<Promotion>> {
        return this.http.get<ApiResponse<Promotion>>(`${this.apiUrl}/${id}`);
    }

    createPromotion(request: CreatePromotionRequest): Observable<ApiResponse<number>> {
        return this.http.post<ApiResponse<number>>(`${this.apiUrl}/create`, request);
    }

    updatePromotion(request: UpdatePromotionRequest): Observable<ApiResponse<boolean>> {
        return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${request.id}/edit`, request);
    }

    deletePromotion(id: number): Observable<ApiResponse<boolean>> {
        return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}/delete`);
    }

    applyPromotion(request: { promoCode: string }): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/promotions/apply`, request);
    }
}
