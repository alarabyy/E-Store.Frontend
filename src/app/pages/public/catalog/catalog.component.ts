import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../cart/services/cart.service';
import { WishlistService } from '../wishlist/services/wishlist.service';
import { ProductService } from './services/product.service';
import { CategoryWithProductsDto } from './models/catalog.model';
import { UrlPipe } from '../../../components/pipes/url.pipe';
import { Product as PublicProduct } from './models/product.model';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { SeoService } from '../../../core/services/seo.service';

@Component({
    selector: 'app-catalog',
    standalone: true,
    imports: [CommonModule, RouterLink, UrlPipe, FormsModule, ProductCardComponent, LoaderComponent],
    templateUrl: './catalog.component.html',
    styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
    cartService = inject(CartService);
    wishlistService = inject(WishlistService);
    productService = inject(ProductService);
    toastService = inject(ToastService);
    seoService = inject(SeoService);

    catalogSections: CategoryWithProductsDto[] = [];
    isLoading = true;
    viewMode: 'grid' | 'list' = 'grid';
    searchQuery = '';
    activeCategory = 'all';
    sidebarOpen = false;
    filtersOpen = false;

    // Advanced Filters
    selectedPriceRange = 'all';
    minPrice: number | null = null;
    maxPrice: number | null = null;
    customMinPrice: number | null = null;
    customMaxPrice: number | null = null;
    selectedRating = 0;
    inStockOnly = false;
    onSaleOnly = false;
    featuredOnly = false;
    sortBy = 'default';

    // Review Modal State
    isReviewModalOpen = false;
    selectedProductForReview: PublicProduct | null = null;
    isSubmittingReview = false;
    newReview = { rating: 5, title: '', comment: '' };

    ngOnInit() {
        this.seoService.setSeoData({
            title: 'Catalog',
            description: 'Explore our comprehensive catalog of products. Browse collections, filter by category and price, and find exactly what your home needs.',
            keywords: 'catalog, products, e-store, categories, buy furniture, shop online'
        });
        this.loadCatalog();
    }

    loadCatalog() {
        this.isLoading = true;
        this.productService.getCatalog().subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.catalogSections = res.data.categories;
                }
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    // ── FLIP BOOK ──────────────────────────────────────────────────────────
    readonly ITEMS_PER_PAGE = 4;
    currentSpread = 0;
    isFlipping = false;
    flipDir: 'next' | 'prev' = 'next';
    isCoverVisible = true;

    get allBookProducts(): PublicProduct[] {
        const all: PublicProduct[] = [];
        this.filteredSections.forEach(s => all.push(...s.products));
        return all;
    }

    get bookSpreads(): { left: PublicProduct[], right: PublicProduct[], leftLabel: string, rightLabel: string }[] {
        const products = this.allBookProducts;
        const spreads: any[] = [];
        const perPage = this.ITEMS_PER_PAGE;
        const totalPages = Math.ceil(products.length / perPage);
        for (let p = 0; p < totalPages; p += 2) {
            spreads.push({
                left: products.slice(p * perPage, (p + 1) * perPage),
                right: products.slice((p + 1) * perPage, (p + 2) * perPage),
                leftLabel: `Page ${p + 1}`,
                rightLabel: `Page ${p + 2}`
            });
        }
        return spreads;
    }

    get totalSpreads(): number { return this.bookSpreads.length; }

    get currentBookSpread() { return this.bookSpreads[this.currentSpread - 1]; }

    flipNext() {
        if (this.isFlipping || this.currentSpread >= this.totalSpreads) return;
        this.flipDir = 'next';
        this.isFlipping = true;
        this.isCoverVisible = false;
        setTimeout(() => { this.currentSpread++; this.isFlipping = false; }, 650);
    }

    flipPrev() {
        if (this.isFlipping || this.currentSpread <= 0) return;
        this.flipDir = 'prev';
        this.isFlipping = true;
        setTimeout(() => {
            this.currentSpread--;
            if (this.currentSpread === 0) this.isCoverVisible = true;
            this.isFlipping = false;
        }, 650);
    }

    getCategoryForProduct(product: PublicProduct): string {
        return this.catalogSections.find(s =>
            s.products.some(p => p.id === product.id)
        )?.name ?? '';
    }

    get bookProgress(): number {
        if (this.totalSpreads === 0) return 0;
        return Math.round((this.currentSpread / this.totalSpreads) * 100);
    }

    get filteredSections(): CategoryWithProductsDto[] {
        let sections = JSON.parse(JSON.stringify(this.catalogSections)) as CategoryWithProductsDto[];

        // Filter by active category
        if (this.activeCategory !== 'all') {
            sections = sections.filter(s => s.slug === this.activeCategory);
        }

        // Apply product-level filters and remove empty sections
        sections = sections.map(s => {
            let filteredProducts = s.products;

            if (this.searchQuery.trim()) {
                const q = this.searchQuery.toLowerCase();
                filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(q));
            }

            if (this.minPrice !== null) {
                filteredProducts = filteredProducts.filter(p => p.minPrice >= this.minPrice!);
            }
            if (this.maxPrice !== null) {
                filteredProducts = filteredProducts.filter(p => p.minPrice <= this.maxPrice!);
            }

            if (this.selectedRating > 0) {
                filteredProducts = filteredProducts.filter(p => (p.averageRating || 0) >= this.selectedRating);
            }

            if (this.inStockOnly) {
                filteredProducts = filteredProducts.filter(p => p.totalStock > 0);
            }

            if (this.onSaleOnly) {
                filteredProducts = filteredProducts.filter(p => p.discountPercentage && p.discountPercentage > 0);
            }

            if (this.featuredOnly) {
                filteredProducts = filteredProducts.filter(p => p.isFeatured);
            }

            // Apply Sorting
            if (this.sortBy === 'price-asc') {
                filteredProducts.sort((a, b) => a.minPrice - b.minPrice);
            } else if (this.sortBy === 'price-desc') {
                filteredProducts.sort((a, b) => b.minPrice - a.minPrice);
            } else if (this.sortBy === 'rating-desc') {
                filteredProducts.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
            } else if (this.sortBy === 'name-asc') {
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            } else if (this.sortBy === 'name-desc') {
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            } else if (this.sortBy === 'most-sold') {
                filteredProducts.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
            } else if (this.sortBy === 'most-reviewed') {
                filteredProducts.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
            }

            return { ...s, products: filteredProducts };
        }).filter(s => s.products.length > 0);

        return sections;
    }

    get hasActiveFilters(): boolean {
        return this.searchQuery !== '' ||
            this.activeCategory !== 'all' ||
            this.selectedPriceRange !== 'all' ||
            this.selectedRating !== 0 ||
            this.inStockOnly ||
            this.onSaleOnly ||
            this.featuredOnly ||
            this.sortBy !== 'default';
    }

    get activeFilterCount(): number {
        let count = 0;
        if (this.searchQuery !== '') count++;
        if (this.activeCategory !== 'all') count++;
        if (this.selectedPriceRange !== 'all') count++;
        if (this.selectedRating !== 0) count++;
        if (this.inStockOnly) count++;
        if (this.onSaleOnly) count++;
        if (this.featuredOnly) count++;
        if (this.sortBy !== 'default') count++;
        return count;
    }

    get totalProducts(): number {
        return this.catalogSections.reduce((sum, s) => sum + s.products.length, 0);
    }

    get filteredCount(): number {
        return this.filteredSections.reduce((sum, s) => sum + s.products.length, 0);
    }

    get totalCategories(): number {
        return this.catalogSections.length;
    }

    setCategory(slug: string) {
        this.activeCategory = slug;
        this.sidebarOpen = false;
        this.currentSpread = 0;
        this.isCoverVisible = true;
        document.getElementById('catalog-content')?.scrollIntoView({ behavior: 'smooth' });
    }

    clearFilters() {
        this.activeCategory = 'all';
        this.searchQuery = '';
        this.selectedPriceRange = 'all';
        this.minPrice = null;
        this.maxPrice = null;
        this.customMinPrice = null;
        this.customMaxPrice = null;
        this.selectedRating = 0;
        this.inStockOnly = false;
        this.onSaleOnly = false;
        this.featuredOnly = false;
        this.sortBy = 'default';

        this.currentSpread = 0;
        this.isCoverVisible = true;
    }

    setPriceFilter(rangeId: string, min: number | null, max: number | null) {
        this.selectedPriceRange = rangeId;
        this.minPrice = min;
        this.maxPrice = max;
        this.currentSpread = 0;
        this.isCoverVisible = true;
    }

    applyCustomPriceRange() {
        this.selectedPriceRange = 'custom';
        this.minPrice = this.customMinPrice;
        this.maxPrice = this.customMaxPrice;
        this.currentSpread = 0;
        this.isCoverVisible = true;
    }

    onPriceFilterSelect(event: Event) {
        const val = (event.target as HTMLSelectElement).value;
        switch (val) {
            case 'all': this.setPriceFilter('all', null, null); break;
            case 'under500': this.setPriceFilter('under500', null, 500); break;
            case '500to1000': this.setPriceFilter('500to1000', 500, 1000); break;
            case '1000to5000': this.setPriceFilter('1000to5000', 1000, 5000); break;
            case 'above5000': this.setPriceFilter('above5000', 5000, null); break;
        }
    }

    setRatingFilter(rating: number) {
        this.selectedRating = rating;
        this.currentSpread = 0;
        this.isCoverVisible = true;
    }

    onRatingFilterSelect(event: Event) {
        const value = parseInt((event.target as HTMLSelectElement).value, 10);
        this.setRatingFilter(value);
    }

    toggleInStock() {
        this.inStockOnly = !this.inStockOnly;
        this.currentSpread = 0;
        this.isCoverVisible = true;
    }

    toggleOnSale() {
        this.onSaleOnly = !this.onSaleOnly;
        this.currentSpread = 0;
        this.isCoverVisible = true;
    }

    toggleFeatured() {
        this.featuredOnly = !this.featuredOnly;
        this.currentSpread = 0;
        this.isCoverVisible = true;
    }

    toggleFilters() {
        this.filtersOpen = !this.filtersOpen;
    }

    onSortChange(event: Event) {
        this.sortBy = (event.target as HTMLSelectElement).value;
        this.currentSpread = 0;
        this.isCoverVisible = true;
    }

    getSectionName(slug: string): string {
        return this.catalogSections.find(s => s.slug === slug)?.name ?? slug;
    }

    getPriceRangeLabel(): string {
        switch (this.selectedPriceRange) {
            case 'under500': return 'Under 500 EGP';
            case '500to1000': return '500 - 1,000 EGP';
            case '1000to5000': return '1,000 - 5,000 EGP';
            case 'above5000': return '5,000+ EGP';
            case 'custom': return `${this.minPrice ?? 0} - ${this.maxPrice ?? '∞'} EGP`;
            default: return '';
        }
    }

    getSortLabel(): string {
        switch (this.sortBy) {
            case 'price-asc': return 'Price ↑';
            case 'price-desc': return 'Price ↓';
            case 'rating-desc': return 'Top Rated';
            case 'name-asc': return 'A → Z';
            case 'name-desc': return 'Z → A';
            case 'most-sold': return 'Most Sold';
            case 'most-reviewed': return 'Most Reviewed';
            default: return '';
        }
    }

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
    }

    addToCart(event: Event, product: PublicProduct) {
        event.stopPropagation();
        this.cartService.addToCart({
            id: product.id, name: product.name,
            price: product.minPrice, image: product.imageUrl
        });
        this.toastService.success('Added to cart! 🛒');
    }

    toggleWishlist(event: Event, product: PublicProduct) {
        event.stopPropagation();
        this.wishlistService.toggleWishlist({
            id: product.id, name: product.name,
            price: product.minPrice, image: product.imageUrl
        });
    }

    openReviewModal(event: Event, product: PublicProduct) {
        event.stopPropagation();
        event.preventDefault();
        this.selectedProductForReview = product;
        this.newReview = { rating: 5, title: '', comment: '' };
        this.isReviewModalOpen = true;
    }

    closeReviewModal() {
        this.isReviewModalOpen = false;
        this.selectedProductForReview = null;
    }

    submitReview() {
        if (!this.selectedProductForReview) return;
        if (!this.newReview.title || !this.newReview.comment) {
            this.toastService.error('Please fill in both title and comment.');
            return;
        }

        this.isSubmittingReview = true;
        this.productService.createProductReview({
            productId: this.selectedProductForReview.id,
            title: this.newReview.title,
            comment: this.newReview.comment,
            rating: this.newReview.rating
        }).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success('Thank you! Your review has been submitted. ⭐');
                    this.closeReviewModal();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to submit review.');
                }
                this.isSubmittingReview = false;
            },
            error: (err) => {
                this.isSubmittingReview = false;
                if (err.status === 401) {
                    this.toastService.error('You must be logged in to post a review.');
                } else {
                    this.toastService.error('An error occurred. Please try again.');
                }
            }
        });
    }
}
