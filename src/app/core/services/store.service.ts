import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PublicStoreInfo, StoreSettings, CategoryTreeMinimal, HomePageBanner, ExclusiveOffer, ShopByItem } from '../models/store.models';

@Injectable({
    providedIn: 'root'
})
export class StoreService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/store`;

    private storeInfoSubject = new BehaviorSubject<PublicStoreInfo | null>(null);
    public storeInfo$ = this.storeInfoSubject.asObservable();

    private settingsSubject = new BehaviorSubject<StoreSettings | null>(null);
    public settings$ = this.settingsSubject.asObservable();

    private categoriesSubject = new BehaviorSubject<CategoryTreeMinimal[]>([]);
    public categories$ = this.categoriesSubject.asObservable();

    private bannersSubject = new BehaviorSubject<HomePageBanner[]>([]);
    public banners$ = this.bannersSubject.asObservable();

    private offersSubject = new BehaviorSubject<ExclusiveOffer[]>([]);
    public offers$ = this.offersSubject.asObservable();

    private itemsSubject = new BehaviorSubject<ShopByItem[]>([]);
    public items$ = this.itemsSubject.asObservable();

    constructor() {
        this.loadStoreInfo();
    }

    public loadStoreInfo(): void {
        this.http.get<ApiResponse<PublicStoreInfo>>(`${this.apiUrl}/info`).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.storeInfoSubject.next(res.data);
                    this.settingsSubject.next(res.data.settings);
                    this.categoriesSubject.next(res.data.categories);
                    this.bannersSubject.next(res.data.homeBanners || []);
                    this.offersSubject.next(res.data.exclusiveOffers || []);
                    this.itemsSubject.next(res.data.shopByItems || []);
                }
            },
            error: (err) => console.error('Failed to load store info', err)
        });
    }

    get settings(): StoreSettings | null {
        return this.settingsSubject.value;
    }

    get categories(): CategoryTreeMinimal[] {
        return this.categoriesSubject.value;
    }
}
