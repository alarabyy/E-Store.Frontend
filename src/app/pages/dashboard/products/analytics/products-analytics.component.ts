import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../product.service';
import { ProductsAnalytics } from '../product.models';
import { environment } from '../../../../../environments/environment';
import { LoaderComponent } from '../../../../components/loader/loader.component';

@Component({
    selector: 'app-products-analytics',
    standalone: true,
    imports: [CommonModule, LoaderComponent],
    templateUrl: './products-analytics.component.html',
    styleUrls: ['./products-analytics.component.scss']
})
export class ProductsAnalyticsComponent implements OnInit {
    private productService = inject(ProductService);
    private cdr = inject(ChangeDetectorRef);

    analytics?: ProductsAnalytics;
    isLoading = true;
    categoryChartGradient = 'conic-gradient(#f1f5f9 0deg 360deg)';

    private colors = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#8b5cf6', // violet
        '#ef4444', // red
        '#06b6d4', // cyan
        '#f43f5e', // rose
        '#84cc16'  // lime
    ];

    ngOnInit() {
        this.loadAnalytics();
    }

    loadAnalytics() {
        this.isLoading = true;
        this.productService.getProductsAnalytics().subscribe({
            next: (res: any) => {
                console.log('Analytics response received:', res);

                // Handle both wrapped StandardResponse and raw data
                if (res.isSuccess && res.data) {
                    this.analytics = res.data;
                } else if (res.totalProducts !== undefined) {
                    // It's the raw object
                    this.analytics = res;
                } else {
                    console.warn('Unexpected response format:', res);
                }

                if (this.analytics) {
                    this.calculateChart();
                }

                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load products analytics', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    private calculateChart() {
        if (!this.analytics || this.analytics.totalProducts === 0) return;

        let currentDeg = 0;
        const parts: string[] = [];
        const total = this.analytics.totalProducts;

        this.analytics.productsByCategory.forEach((cat, index) => {
            const color = this.colors[index % this.colors.length];
            const deg = (cat.productCount / total) * 360;
            parts.push(`${color} ${currentDeg}deg ${currentDeg + deg}deg`);
            currentDeg += deg;
        });

        if (parts.length > 0) {
            this.categoryChartGradient = `conic-gradient(${parts.join(', ')})`;
        }
    }

    getCategoryColor(index: number): string {
        return this.colors[index % this.colors.length];
    }

    getImageUrl(path: string | null | undefined): string {
        if (!path) return 'assets/images/placeholder.png';
        if (path.startsWith('http')) return path;
        return `${environment.backendUrl}/${path}`;
    }
}
