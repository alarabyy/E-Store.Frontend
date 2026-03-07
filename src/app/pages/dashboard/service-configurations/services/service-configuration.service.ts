import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/api/models/api-response.model';
import { ServiceConfigurationDto, ServiceType } from '../models/service-configuration.model';

@Injectable({
    providedIn: 'root'
})
export class ServiceConfigurationService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/dashboard/services`;

    getServices(type?: ServiceType): Observable<ApiResponse<ServiceConfigurationDto[]>> {
        let params = new HttpParams();
        if (type !== undefined) {
            params = params.set('type', type.toString());
        }

        return this.http.get<ApiResponse<ServiceConfigurationDto[]>>(`${this.apiUrl}/list`, { params });
    }

    createService(payload: any): Observable<ApiResponse<number>> {
        const formData = this.toFormData(payload);
        return this.http.post<ApiResponse<number>>(`${this.apiUrl}/create`, formData);
    }

    updateService(payload: any): Observable<ApiResponse> {
        const formData = this.toFormData(payload);
        return this.http.put<ApiResponse>(`${this.apiUrl}/update`, formData);
    }

    private toFormData(payload: any): FormData {
        const formData = new FormData();
        Object.keys(payload).forEach(key => {
            const value = payload[key];
            // Map camelCase to PascalCase for the backend command
            const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);

            if (value instanceof File) {
                formData.append(pascalKey, value);
            } else if (Array.isArray(value)) {
                // .NET model binding prefers repeated keys for List<string>
                value.forEach(v => formData.append(pascalKey, v));
            } else if (value !== null && value !== undefined) {
                formData.append(pascalKey, value.toString());
            }
        });
        return formData;
    }

    toggleService(id: number, enable: boolean): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/toggle`, { id, enable });
    }

    configureService(serviceConfigurationId: number, values: Record<string, string>): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/configure`, {
            serviceConfigurationId,
            values,
            encryptedValues: {},
            metadata: {},
            isActive: true
        });
    }
}
