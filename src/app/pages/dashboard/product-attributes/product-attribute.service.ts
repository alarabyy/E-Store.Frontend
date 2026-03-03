import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/api/models/api-response.model';
import { ProductAttribute, CreateProductAttributeRequest, UpdateProductAttributeRequest } from './product-attribute.models';

@Injectable({
    providedIn: 'root'
})
export class ProductAttributeService {
    private apiUrl = `${environment.apiUrl}/product-attributes-dashboard`;
    private http = inject(HttpClient);

    getAttributesByCategory(categoryId: number): Observable<ApiResponse<ProductAttribute[]>> {
        return this.http.get<ApiResponse<ProductAttribute[]>>(`${this.apiUrl}/category/${categoryId}`);
    }

    createAttribute(req: CreateProductAttributeRequest): Observable<ApiResponse<number>> {
        return this.http.post<ApiResponse<number>>(`${this.apiUrl}/create`, req);
    }

    updateAttribute(req: UpdateProductAttributeRequest): Observable<ApiResponse<boolean>> {
        return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/update`, req);
    }

    deleteAttribute(id: number): Observable<ApiResponse<boolean>> {
        return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/delete/${id}`);
    }
}
