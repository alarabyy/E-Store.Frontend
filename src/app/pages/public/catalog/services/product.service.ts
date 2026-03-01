import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../components/models/api-response.model';
import { Product } from '../models/product.model';
import { CatalogDto } from '../models/catalog.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = `${environment.apiUrl}`;
    private http = inject(HttpClient);

    // Public API
    getCatalog(): Observable<ApiResponse<CatalogDto>> {
        return this.http.get<ApiResponse<CatalogDto>>(`${this.apiUrl}/catalog`).pipe(
            map(res => {
                const mapProduct = (p: any) => ({
                    ...p,
                    imageUrl: (p.imageUrl && p.imageUrl !== 'string' && p.imageUrl !== 'null') ? p.imageUrl : (p.images && p.images.length > 0 ? p.images[0].imageUrl : ''),
                    imagesList: p.images?.map((img: any) => img.imageUrl) || [],
                    totalStock: p.variants?.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0) || 0
                });

                if (res.isSuccess && res.data && res.data.categories) {
                    res.data.categories = res.data.categories.map(cat => ({
                        ...cat,
                        products: cat.products?.map(mapProduct)
                    }));
                }
                return res;
            })
        );
    }

    getProducts(category?: string): Observable<ApiResponse<Product[]>> {
        let params = new HttpParams();
        if (category) {
            params = params.set('category', category);
        }
        return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products/list`, { params }).pipe(
            map(res => {
                if (res.isSuccess && res.data) {
                    res.data = res.data.map(p => ({
                        ...p,
                        imageUrl: (p.imageUrl && p.imageUrl !== 'string' && p.imageUrl !== 'null') ? p.imageUrl : (p.images && p.images.length > 0 ? p.images[0].imageUrl : ''),
                        imagesList: p.images?.map((img: any) => img.imageUrl) || [],
                        totalStock: p.variants?.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0) || 0
                    }));
                }
                return res;
            })
        );
    }

    getProductBySlug(slug: string): Observable<ApiResponse<Product>> {
        return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/products/${slug}`).pipe(
            map(res => {
                if (res.isSuccess && res.data) {
                    const p = res.data;
                    res.data = {
                        ...p,
                        imageUrl: p.imageUrl || (p.images && p.images.length > 0 ? p.images[0].imageUrl : ''),
                        imagesList: p.images?.map(img => img.imageUrl) || [],
                        totalStock: p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) || 0
                    };
                }
                return res;
            })
        );
    }

    getProductReviews(productId: number, page: number = 1, pageSize: number = 10): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/public/products/${productId}/reviews`, {
            params: { page: page.toString(), pageSize: pageSize.toString() }
        });
    }

    createProductReview(review: any): Observable<ApiResponse<number>> {
        return this.http.post<ApiResponse<number>>(`${this.apiUrl}/product-reviews`, review);
    }
}
