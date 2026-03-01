import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.models';
import { PagedResponse } from '../models/pagination.models';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private dashboardUrl = `${environment.apiUrl}/categories-dashboard`;
    private http = inject(HttpClient);

    // Dashboard API Methods
    getCategories(page: number = 1, pageSize: number = 10): Observable<PagedResponse<Category>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());
        return this.http.get<PagedResponse<Category>>(`${this.dashboardUrl}/list`, { params });
    }

    getCategoryById(id: number): Observable<ApiResponse<Category>> {
        return this.http.get<ApiResponse<Category>>(`${this.dashboardUrl}/${id}`);
    }

    createCategory(category: CreateCategoryRequest): Observable<ApiResponse<number>> {
        const formData = this.toFormData(category);
        return this.http.post<ApiResponse<number>>(`${this.dashboardUrl}/create`, formData);
    }

    updateCategory(category: UpdateCategoryRequest): Observable<ApiResponse<boolean>> {
        const formData = this.toFormData(category);
        return this.http.put<ApiResponse<boolean>>(`${this.dashboardUrl}/update`, formData);
    }

    private toFormData(obj: any): FormData {
        const formData = new FormData();
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            if (value !== null && value !== undefined) {
                if (value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, value.toString());
                }
            }
        });
        return formData;
    }

    deleteCategory(id: number): Observable<ApiResponse<boolean>> {
        return this.http.delete<ApiResponse<boolean>>(`${this.dashboardUrl}/delete/${id}`);
    }

    toggleStatus(id: number): Observable<ApiResponse<boolean>> {
        return this.http.patch<ApiResponse<boolean>>(`${this.dashboardUrl}/toggle-status/${id}`, {});
    }

    getAllActive(): Observable<ApiResponse<Category[]>> {
        return this.http.get<ApiResponse<Category[]>>(`${this.dashboardUrl}/active-list`);
    }
}
