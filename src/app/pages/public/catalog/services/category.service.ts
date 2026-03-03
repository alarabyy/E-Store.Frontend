import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/api/models/api-response.model';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = `${environment.apiUrl}/categories`;
    private http = inject(HttpClient);

    getCategoryBySlug(slug: string, page: number = 1, pageSize: number = 20): Observable<ApiResponse<any>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${slug}`, { params }).pipe(
            map(res => {
                const mapProduct = (p: any) => ({
                    ...p,
                    imageUrl: (p.imageUrl && p.imageUrl !== 'string' && p.imageUrl !== 'null') ? p.imageUrl : (p.images && p.images.length > 0 ? p.images[0].imageUrl : ''),
                    imagesList: p.images?.map((img: any) => img.imageUrl) || [],
                    totalStock: p.variants?.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0) || 0
                });

                if (res.isSuccess && res.data && res.data.products?.data) {
                    res.data.products.data = res.data.products.data.map(mapProduct);
                }
                return res;
            })
        );
    }
}
