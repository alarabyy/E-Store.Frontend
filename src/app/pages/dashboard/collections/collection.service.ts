import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Collection, CreateCollectionRequest, UpdateCollectionRequest, ManageCollectionProductsRequest } from './collection.models';

@Injectable({
    providedIn: 'root'
})
export class CollectionService {
    private apiUrl = `${environment.apiUrl}/collections-dashboard`;

    constructor(private http: HttpClient) { }

    getCollections(page: number = 1, pageSize: number = 100): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/list`, {
            params: { page, pageSize }
        });
    }


    getCollectionById(id: number): Observable<ApiResponse<Collection>> {
        return this.http.get<ApiResponse<Collection>>(`${this.apiUrl}/${id}`);
    }

    createCollection(req: CreateCollectionRequest): Observable<ApiResponse<number>> {
        const formData = this.toFormData(req);
        return this.http.post<ApiResponse<number>>(`${this.apiUrl}/create`, formData);
    }

    updateCollection(id: number, req: UpdateCollectionRequest): Observable<ApiResponse<boolean>> {
        const formData = this.toFormData(req);
        // Note: FastEndpoints route param {Id} maps to req.Id
        return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}/edit`, formData);
    }

    deleteCollection(id: number): Observable<ApiResponse<boolean>> {
        return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}/delete`);
    }

    manageProducts(req: ManageCollectionProductsRequest): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/assign-products`, req);
    }

    private toFormData(obj: any): FormData {
        const formData = new FormData();
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            if (value !== null && value !== undefined) {
                // Ensure PascalCase for backend matching if needed, 
                // but let's be explicit for the main fields
                const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);

                if (value instanceof File) {
                    formData.append(capitalizedKey, value);
                } else if (Array.isArray(value)) {
                    // Handle arrays if necessary, though collections usually don't have them in simple create
                    value.forEach((item, index) => {
                        formData.append(`${capitalizedKey}[${index}]`, item.toString());
                    });
                } else {
                    formData.append(capitalizedKey, value.toString());
                }
            }
        });
        return formData;
    }
}

