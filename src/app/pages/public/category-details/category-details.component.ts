import { Component, OnInit, inject, ChangeDetectorRef, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoryService } from '../catalog/services/category.service';
import { UrlPipe } from '../../../components/pipes/url.pipe';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { SeoService } from '../../../core/seo/services/seo.service';

@Component({
    selector: 'app-category-details',
    standalone: true,
    imports: [CommonModule, RouterLink, UrlPipe, ProductCardComponent, LoaderComponent],
    templateUrl: './category-details.component.html',
    styleUrls: ['./category-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private categoryService = inject(CategoryService);
    private cdr = inject(ChangeDetectorRef);
    private seoService = inject(SeoService);

    // Signals
    category = signal<any>(null);
    products = signal<any[]>([]);
    isLoading = signal(true);
    error = signal(false);

    // Pagination signals
    currentPage = signal(1);
    totalPages = signal(1);
    totalCount = signal(0);
    pageSize = 20;

    // Computed page numbers
    pageNumbers = computed(() => {
        const pages: number[] = [];
        const current = this.currentPage();
        const total = this.totalPages();
        const delta = 2;
        const left = Math.max(1, current - delta);
        const right = Math.min(total, current + delta);
        for (let i = left; i <= right; i++) {
            pages.push(i);
        }
        return pages;
    });

    private currentSlug = '';

    ngOnInit() {
        this.route.params.subscribe(params => {
            const slug = params['slug'];
            if (slug) {
                this.currentSlug = slug;
                this.currentPage.set(1);
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                this.loadCategory(slug);
            }
        });
    }

    loadCategory(slug: string, page: number = 1) {
        this.isLoading.set(true);
        this.error.set(false);

        this.categoryService.getCategoryBySlug(slug, page, this.pageSize).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.category.set(res.data);
                    const pagedProducts = res.data.products;
                    this.products.set(pagedProducts?.data || []);
                    this.totalCount.set(pagedProducts?.totalCount || this.products().length);
                    this.totalPages.set(pagedProducts?.totalPages || 1);
                    this.currentPage.set(pagedProducts?.currentPage || page);
                    this.updateMetaTags();
                } else {
                    this.error.set(true);
                }
                this.isLoading.set(false);
                this.cdr.markForCheck();
            },
            error: () => {
                this.error.set(true);
                this.isLoading.set(false);
                this.cdr.markForCheck();
            }
        });
    }

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.loadCategory(this.currentSlug, page);
    }

    private updateMetaTags() {
        const cat = this.category();
        if (!cat) return;

        this.seoService.setSeoData({
            title: cat.metaTitle || cat.name,
            description: cat.metaDescription || cat.description || `Browse ${cat.name} collection.`,
            keywords: `${cat.name}, furniture, modern decor`,
            image: cat.imageUrl,
            type: 'article'
        });
    }

    trackById(index: number, item: any): any {
        return item.id || index;
    }
}
