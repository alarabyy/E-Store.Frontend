import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/api-response.model';

@Injectable({
    providedIn: 'root'
})
export class CollectionService {
    private apiUrl = `${environment.apiUrl}/collections`;
    private http = inject(HttpClient);

    getCollectionBySlug(slug: string): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${slug}`).pipe(
            map(res => {
                if (res.isSuccess && res.data && res.data.products) {
                    res.data.products = res.data.products.map((p: any) => ({
                        ...p,
                        imageUrl: (p.imageUrl && p.imageUrl !== 'string' && p.imageUrl !== 'null')
                            ? p.imageUrl
                            : (p.images && p.images.length > 0 ? p.images[0].imageUrl : ''),
                        imagesList: p.images?.map((img: any) => img.imageUrl) || [],
                        totalStock: p.variants?.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0) || 0
                    }));
                }
                return res;
            })
        );
    }

    /**
     * Gets the paginated list of active collections.
     * Corresponds to: GET /api/collections/list?page=&pageSize=
     */
    getCollectionsList(page: number = 1, pageSize: number = 12): Observable<any> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());
        return this.http.get<any>(`${this.apiUrl}/list`, { params });
    }
}
