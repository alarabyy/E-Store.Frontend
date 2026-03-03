import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { ApiResponse } from '../../../../../../core/api/models/api-response.model';
import { Observable } from 'rxjs';
import { UpdateStoreSettingsRequest } from './general-info.model';

@Injectable({
    providedIn: 'root'
})
export class GeneralInfoService {
    private apiUrl = `${environment.apiUrl}/store-dashboard/settings`;
    private http = inject(HttpClient);

    updateSettings(request: FormData): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.apiUrl}/edit`, request);
    }
}
