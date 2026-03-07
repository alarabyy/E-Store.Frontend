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
        return this.http.post<ApiResponse<number>>(`${this.apiUrl}/create`, payload);
    }

    updateService(payload: any): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.apiUrl}/update`, payload);
    }

    toggleService(id: number, enable: boolean): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/toggle`, { id, enable });
    }

    configureService(id: number, values: Record<string, string>): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/configure`, { id, values });
    }
}
