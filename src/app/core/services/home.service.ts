import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface HomeDataDto {
    homeBanners: HomeBanner[];
    exclusiveOffers: ExclusiveOffer[];
    shopByItems: ShopByItem[];
    categories: HomeCategory[];
}

export interface HomeBanner {
    id: number;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    linkUrl?: string;
    displayOrder: number;
    isActive: boolean;
}

export interface ExclusiveOffer {
    id: number;
    title: string;
    description?: string;
    imageUrl?: string;
    linkUrl?: string;
    displayOrder: number;
    isActive: boolean;
}

export interface ShopByItem {
    id: number;
    title: string;
    imageUrl?: string;
    linkUrl?: string;
    displayOrder: number;
    isActive: boolean;
}

export interface HomeCategory {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string;
    products: HomeProduct[];
}

export interface HomeProduct {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string;
    categoryName?: string;
    minPrice: number;
    maxPrice: number;
    discountPercentage?: number;
    averageRating: number;
    reviewCount: number;
    isInWishlist: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class HomeService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/home/data`;

    getHomeData(): Observable<ApiResponse<HomeDataDto>> {
        return this.http.get<ApiResponse<HomeDataDto>>(this.apiUrl).pipe(
            map(res => {
                if (res.isSuccess && res.data) {
                    // Map product imageUrls consistently
                    res.data.categories = res.data.categories.map(cat => ({
                        ...cat,
                        products: (cat.products || []).map((p: any) => ({
                            ...p,
                            imageUrl: (p.imageUrl && p.imageUrl !== 'string' && p.imageUrl !== 'null')
                                ? p.imageUrl : ''
                        }))
                    }));
                }
                return res;
            })
        );
    }

    subscribe(email: string): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${environment.apiUrl}/newsletter/subscribe`, { email });
    }

    unsubscribe(email: string): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${environment.apiUrl}/newsletter/unsubscribe`, { email });
    }
}
