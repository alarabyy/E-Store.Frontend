import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../store.service';
import { StoreDashboardSettingsResponse } from '../../../../core/models/store.models';
import { GeneralInfoComponent } from './components/general-info/general-info.component';
import { HomeBannersComponent } from './components/home-banners/home-banners.component';
import { ExclusiveOffersComponent } from './components/exclusive-offers/exclusive-offers.component';
import { ShopByItemsComponent } from './components/shop-by-items/shop-by-items.component';

@Component({
    selector: 'app-store-settings',
    standalone: true,
    imports: [
        CommonModule,
        GeneralInfoComponent,
        HomeBannersComponent,
        ExclusiveOffersComponent,
        ShopByItemsComponent
    ],
    templateUrl: './store-settings.component.html',
    styleUrl: './store-settings.component.scss'
})
export class StoreSettingsComponent implements OnInit {
    activeTab: 'general' | 'banners' | 'offers' | 'items' = 'general';
    isLoading = true;
    settingsResponse: StoreDashboardSettingsResponse | null = null;

    private storeService = inject(StoreService);

    ngOnInit(): void {
        this.loadSettings();
    }

    loadSettings(): void {
        this.isLoading = true;
        this.storeService.getSettings().subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.settingsResponse = res.data;
                }
                this.isLoading = false;
            },
            error: (err) => {
                this.isLoading = false;
                console.error(err);
            }
        });
    }

    setTab(tab: 'general' | 'banners' | 'offers' | 'items'): void {
        this.activeTab = tab;
    }
}
