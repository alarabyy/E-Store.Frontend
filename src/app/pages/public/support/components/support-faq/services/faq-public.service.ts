import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';
import { ApiResponse } from '../../../../../../components/models/api-response.model';
import { FAQ } from '../../../../../dashboard/faqs/models/faq.models';

@Injectable({
    providedIn: 'root'
})
export class FaqPublicService {
    private apiUrl = `${environment.apiUrl}/faqs/list`;
    private http = inject(HttpClient);

    getFaqs(): Observable<ApiResponse<FAQ[]>> {
        return this.http.get<ApiResponse<FAQ[]>>(this.apiUrl);
    }
}
