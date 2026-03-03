import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoryService } from '../catalog/services/category.service';
import { UrlPipe } from '../../../components/pipes/url.pipe';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { Title, Meta } from '@angular/platform-browser';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { SeoService } from '../../../core/seo/services/seo.service';

@Component({
    selector: 'app-category-details',
    standalone: true,
    imports: [CommonModule, RouterLink, UrlPipe, ProductCardComponent, LoaderComponent],
    templateUrl: './category-details.component.html',
    styleUrls: ['./category-details.component.scss']
})
export class CategoryDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private categoryService = inject(CategoryService);
    private titleService = inject(Title);
    private metaService = inject(Meta);
    private cdr = inject(ChangeDetectorRef);
    private seoService = inject(SeoService);

    category: any = null;
    products: any[] = [];
    isLoading = true;
    error = false;

    // Pagination
    currentPage = 1;
    totalPages = 1;
    pageSize = 20;
    totalCount = 0;
    pageNumbers: number[] = [];

    private currentSlug = '';

    ngOnInit() {
        // whenever the route slug changes we reset the state and
        // scroll to the top of the page so the user doesn't land
        // in the middle of the previous view.
        this.route.params.subscribe(params => {
            const slug = params['slug'];
            if (slug) {
                this.currentSlug = slug;
                this.currentPage = 1;
                // make sure the viewport is at the top when new category loads
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                this.loadCategory(slug);
            }
        });
    }

    loadCategory(slug: string, page: number = 1) {
        this.isLoading = true;
        this.error = false;

        this.categoryService.getCategoryBySlug(slug, page, this.pageSize).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.category = res.data;
                    const pagedProducts = res.data.products;
                    this.products = pagedProducts?.data || [];
                    this.totalCount = pagedProducts?.totalCount || this.products.length;
                    this.totalPages = pagedProducts?.totalPages || 1;
                    this.currentPage = pagedProducts?.currentPage || page;
                    this.buildPageNumbers();
                    this.updateMetaTags();
                    // make sure the view picks up the changes immediately
                    this.cdr.detectChanges();
                } else {
                    this.error = true;
                }
                // hide loader as soon as data is processed (no artificial delay)
                this.isLoading = false;
            },
            error: () => {
                this.error = true;
                this.isLoading = false;
            }
        });
    }

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) return;
        this.currentPage = page;
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.loadCategory(this.currentSlug, page);
    }

    private buildPageNumbers() {
        const pages: number[] = [];
        const delta = 2;
        const left = Math.max(1, this.currentPage - delta);
        const right = Math.min(this.totalPages, this.currentPage + delta);
        for (let i = left; i <= right; i++) {
            pages.push(i);
        }
        this.pageNumbers = pages;
    }

    private updateMetaTags() {
        if (!this.category) return;

        const title = this.category.metaTitle || this.category.name;
        const description = this.category.metaDescription || this.category.description || `Browse ${this.category.name} collection at E-Store.`;

        this.seoService.setSeoData({
            title: title,
            description: description,
            keywords: `${this.category.name}, buy online, tech partner`,
            image: this.category.imageUrl,
            type: 'article'
        });
    }
}
