import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PagedResponse } from '../../../core/models/pagination.models';
import { ProductReview } from './product-review.models';

@Injectable({
    providedIn: 'root'
})
export class ProductReviewService {
    private apiUrl = `${environment.apiUrl}/product-reviews-dashboard`;
    private http = inject(HttpClient);

    getReviews(page: number = 1, pageSize: number = 10, searchTerm?: string, rating?: number): Observable<PagedResponse<ProductReview>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());
        if (searchTerm) params = params.set('searchTerm', searchTerm);
        if (rating != null) params = params.set('rating', rating.toString());
        return this.http.get<PagedResponse<ProductReview>>(`${this.apiUrl}/list`, { params });
    }

    deleteReview(id: number): Observable<ApiResponse<boolean>> {
        return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}/delete`);
    }
}
