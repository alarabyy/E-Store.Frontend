import { Component, OnInit, inject, ViewChild, ElementRef, ChangeDetectorRef, HostListener, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from './services/product.service';
import { CartService } from '../cart/services/cart.service';
import { WishlistService } from '../wishlist/services/wishlist.service';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { UrlPipe } from '../../../components/pipes/url.pipe';
import { CollectionService } from './services/collection.service';
import { AutoScrollDirective } from '../../../core/directives/auto-scroll.directive';
import { Product } from './models/product.model';
import { SeoService } from '../../../core/seo/services/seo.service';
import { ToastService } from '../../../components/toast/services/toast.service';

@Component({
    selector: 'app-catalog',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent, LoaderComponent, UrlPipe, AutoScrollDirective],
    templateUrl: './catalog.component.html',
    styleUrls: ['./catalog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogComponent implements OnInit {
    private productService = inject(ProductService);
    private cartService = inject(CartService);
    private wishlistService = inject(WishlistService);
    private route = inject(ActivatedRoute);
    protected cdr = inject(ChangeDetectorRef);
    private seoService = inject(SeoService);
    private toastService = inject(ToastService);

    // Signals for state
    catalogSections = signal<any[]>([]);
    isLoading = signal(true);
    searchQuery = signal('');
    activeCategory = signal('all');
    sortBy = signal('default');

    // Advanced Filters
    minPrice = signal<number | null>(null);
    maxPrice = signal<number | null>(null);
    minRating = signal(0);
    onlyInStock = signal(false);
    onlyOnSale = signal(false);
    onlyFeatured = signal(false);
    showFilters = signal(false); // Mobile sidebar toggle
    isSticky = signal(false);

    // Flip Book Logic
    currentSpread = signal(0);
    isFlipping = signal(false);
    flipDir = signal<'next' | 'prev'>('next');
    isCoverVisible = signal(true);
    readonly ITEMS_PER_PAGE = 4;

    // Quick View state
    isQuickViewOpen = signal(false);
    selectedProduct = signal<any>(null);
    isLoadingProduct = signal(false);
    activeImage = signal('');

    @ViewChild('bookContainer') bookContainer!: ElementRef;

    // Computed filtered and sorted sections
    filteredSections = computed(() => {
        const query = this.searchQuery().toLowerCase();
        const category = this.activeCategory();
        const sort = this.sortBy();
        const minP = this.minPrice();
        const maxP = this.maxPrice();
        const minR = this.minRating();
        const inStock = this.onlyInStock();
        const onSale = this.onlyOnSale();
        const featured = this.onlyFeatured();

        let sections = this.catalogSections();

        // 1. Filter by category
        if (category !== 'all') {
            sections = sections.filter(s => s.slug === category);
        }

        // 2. Filter products within sections
        return sections.map(cat => {
            let products = [...(cat.products || [])];

            // Search
            if (query) {
                products = products.filter(p =>
                    p.name.toLowerCase().includes(query) ||
                    p.description?.toLowerCase().includes(query)
                );
            }

            // Price
            if (minP !== null) products = products.filter(p => p.minPrice >= minP || (p.price && p.price >= minP));
            if (maxP !== null) products = products.filter(p => p.minPrice <= maxP || (p.price && p.price <= maxP));

            // Rating
            if (minR > 0) products = products.filter(p => (p.averageRating || 0) >= minR);

            // Stock
            if (inStock) products = products.filter(p => p.totalStock > 0);

            // On Sale
            if (onSale) products = products.filter(p => (p.discountPercentage && p.discountPercentage > 0) || (p.oldPrice && p.oldPrice > p.price));

            // Featured
            if (featured) products = products.filter(p => p.isFeatured);

            // Sort
            if (sort === 'price-asc') products.sort((a, b) => a.minPrice - b.minPrice);
            else if (sort === 'price-desc') products.sort((a, b) => b.minPrice - a.minPrice);
            else if (sort === 'name-asc') products.sort((a, b) => a.name.localeCompare(b.name));
            else if (sort === 'rating-desc') products.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));

            return { ...cat, products };
        }).filter(cat => cat.products.length > 0);
    });

    ngOnInit() {
        this.seoService.setSeoData({
            title: 'Catalog',
            description: 'Explore our comprehensive catalog of products. Browse collections, filter by category and price, and find exactly what your home needs.',
            keywords: 'catalog, products, e-store, categories, buy furniture, shop online'
        });

        this.route.queryParams.subscribe(params => {
            if (params['category']) {
                this.activeCategory.set(params['category']);
            }
            this.loadCatalog();
        });
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isSticky.set(window.pageYOffset > 300);
    }

    trackById(index: number, item: any): any {
        return item.id || index;
    }

    loadCatalog() {
        this.isLoading.set(true);
        this.productService.getCatalog().subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.catalogSections.set(res.data.categories);
                }
                this.isLoading.set(false);
                this.cdr.markForCheck();
            },
            error: () => {
                this.isLoading.set(false);
                this.cdr.markForCheck();
            }
        });
    }

    onSearchChange(query: string) {
        this.searchQuery.set(query);
        this.resetPagination();
    }

    onSortChange(event: Event) {
        const val = (event.target as HTMLSelectElement).value;
        this.sortBy.set(val);
    }

    setCategory(slug: string) {
        this.activeCategory.set(slug);
        this.resetPagination();
    }

    resetPagination() {
        this.currentSpread.set(0);
        this.isCoverVisible.set(true);
    }

    setPriceRange(min: number | null, max: number | null) {
        this.minPrice.set(min);
        this.maxPrice.set(max);
        this.resetPagination();
    }

    toggleFilters() {
        this.showFilters.update(v => !v);
    }

    clearAllFilters() {
        this.searchQuery.set('');
        this.activeCategory.set('all');
        this.minPrice.set(null);
        this.maxPrice.set(null);
        this.minRating.set(0);
        this.onlyInStock.set(false);
        this.onlyOnSale.set(false);
        this.onlyFeatured.set(false);
        this.sortBy.set('default');
    }

    removeFilter(type: string) {
        if (type === 'search') this.searchQuery.set('');
        else if (type === 'category') this.activeCategory.set('all');
        else if (type === 'price') { this.minPrice.set(null); this.maxPrice.set(null); }
        else if (type === 'rating') this.minRating.set(0);
        else if (type === 'stock') this.onlyInStock.set(false);
        else if (type === 'sale') this.onlyOnSale.set(false);
        else if (type === 'featured') this.onlyFeatured.set(false);
    }

    openQuickView(event: Event, product: any) {
        event.stopPropagation();
        event.preventDefault();

        this.selectedProduct.set(product);
        this.isQuickViewOpen.set(true);
        this.isLoadingProduct.set(true);
        this.activeImage.set(product.imageUrl);

        this.productService.getProductBySlug(product.slug).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.selectedProduct.set(res.data);
                    this.activeImage.set(res.data.imageUrl);
                }
                this.isLoadingProduct.set(false);
                this.cdr.markForCheck();
            },
            error: () => {
                this.isLoadingProduct.set(false);
                this.cdr.markForCheck();
            }
        });
    }

    closeQuickView() {
        this.isQuickViewOpen.set(false);
        this.selectedProduct.set(null);
    }

    addToCart(event: Event, product: any) {
        event.stopPropagation();
        this.cartService.addToCart({
            id: product.id,
            name: product.name,
            price: product.minPrice,
            image: product.imageUrl
        });
        this.toastService.success('Added to cart!');
    }

    toggleWishlist(event: Event, product: any) {
        event.stopPropagation();
        this.wishlistService.toggleWishlist({
            id: product.id,
            name: product.name,
            price: product.minPrice,
            image: product.imageUrl
        });
    }

    // Book Logic
    get allBookProducts(): any[] {
        const all: any[] = [];
        this.filteredSections().forEach(s => all.push(...s.products));
        return all;
    }

    get bookSpreads(): any[] {
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

    get currentBookSpread() {
        const spreads = this.bookSpreads;
        const index = this.currentSpread() - 1;
        return (index >= 0 && index < spreads.length) ? spreads[index] : null;
    }

    nextSpread() {
        if (this.isFlipping()) return;
        const total = this.bookSpreads.length;
        if (this.currentSpread() < total) {
            this.isFlipping.set(true);
            this.flipDir.set('next');
            this.isCoverVisible.set(false);
            setTimeout(() => {
                this.currentSpread.update(c => c + 1);
                this.isFlipping.set(false);
                this.cdr.markForCheck();
            }, 600);
        }
    }

    prevSpread() {
        if (this.isFlipping() || this.currentSpread() <= 0) return;
        this.isFlipping.set(true);
        this.flipDir.set('prev');
        setTimeout(() => {
            this.currentSpread.update(c => c - 1);
            if (this.currentSpread() === 0) this.isCoverVisible.set(true);
            this.isFlipping.set(false);
            this.cdr.markForCheck();
        }, 600);
    }

    scrollContainer(element: HTMLElement, direction: number) {
        if (!element || !element.firstElementChild) return;

        const cardWidth = (element.firstElementChild as HTMLElement).offsetWidth;
        const scrollAmount = (cardWidth + 24) * direction;

        const isAtEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 10;
        const isAtStart = element.scrollLeft <= 10;

        if (direction === 1 && isAtEnd) {
            // Loop to start
            element.scrollTo({ left: 0, behavior: 'smooth' });
        } else if (direction === -1 && isAtStart) {
            // Loop to end
            element.scrollTo({ left: element.scrollWidth, behavior: 'smooth' });
        } else {
            element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }

        // Force re-check after animation
        setTimeout(() => this.cdr.markForCheck(), 600);
    }

    canScrollLeft(element: HTMLElement): boolean {
        // If looping is desired, always return true if scrollable content exists
        return element ? element.scrollWidth > element.clientWidth : false;
    }

    canScrollRight(element: HTMLElement): boolean {
        return element ? element.scrollWidth > element.clientWidth : false;
    }
}
