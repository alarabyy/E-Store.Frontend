import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/api/models/api-response.model';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    isActive: boolean;
    stock: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = `${environment.apiUrl}/products`;
    private dashboardUrl = `${environment.apiUrl}/products-dashboard`;
    private http = inject(HttpClient);

    // Public API
    getProducts(category?: string): Observable<ApiResponse<Product[]>> {
        let params = new HttpParams();
        if (category) {
            params = params.set('category', category);
        }
        return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/list`, { params });
    }

    // Dashboard API
    createProduct(product: Partial<Product>): Observable<ApiResponse<number>> {
        return this.http.post<ApiResponse<number>>(`${this.dashboardUrl}/create`, product);
    }
}
