import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ChangeDetectionStrategy, signal, computed, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../cart/services/cart.service';
import { WishlistService } from '../wishlist/services/wishlist.service';
import { UrlPipe } from '../../../components/pipes/url.pipe';
import { StoreService } from '../../dashboard/store/services/store.service';
import { HomeService, HomeDataDto, HomeProduct } from './services/home.service';
import { CollectionService } from '../catalog/services/collection.service';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { ToastService } from '../../../components/toast/services/toast.service';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { SeoService } from '../../../core/seo/services/seo.service';
import { AutoScrollDirective } from '../../../core/directives/auto-scroll.directive';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink, UrlPipe, ProductCardComponent, LoaderComponent, AutoScrollDirective],
    templateUrl: './home.html',
    styleUrls: ['./home.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
    private cartService = inject(CartService);
    public wishlistService = inject(WishlistService);
    private homeService = inject(HomeService);
    public storeService = inject(StoreService);
    private toastService = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);
    private router = inject(Router);
    private seoService = inject(SeoService);
    private platformId = inject(PLATFORM_ID);
    private ngZone = inject(NgZone);
    private collectionService = inject(CollectionService);

    public settings$ = this.storeService.settings$;

    // State via Signals
    carouselOffers = signal<any[]>([]);
    offers = signal<any[]>([]);
    shopByItems = signal<any[]>([]);
    categories = signal<any[]>([]);
    featuredProducts = signal<any[]>([]);
    featuredCollections = signal<any[]>([]);
    isLoading = signal(true);
    currentSlide = signal(0);

    // Flash Toast Signals
    showFlashToast = signal(false);
    flashToastVisible = signal(false);
    flashOffer = signal<any>(null);
    isFlashToastPaused = signal(false);

    private slideInterval: any;
    private flashToastTimer: any;
    private flashToastStartTime = 0;
    private flashToastRemaining = 8000;
    private parallaxListener: ((e: MouseEvent) => void) | null = null;

    ngOnInit() {
        this.seoService.setSeoData({
            title: 'Home',
            description: 'Discover the best modern furniture, Italian carpets, and classic salon pieces at E-Store. High quality and exclusive tech & decor products tailored for your home.',
            keywords: 'furniture, carpets, decor, e-store, tech partner, modern home design'
        });

        this.loadHomeData();
        this.loadFeaturedCollections();

        if (isPlatformBrowser(this.platformId)) {
            this.initParallax();
        }
    }

    ngOnDestroy() {
        this.stopSlideTimer();
        if (this.flashToastTimer) clearTimeout(this.flashToastTimer);
        if (this.parallaxListener) {
            window.removeEventListener('mousemove', this.parallaxListener);
        }
    }

    trackById(index: number, item: any): any {
        return item.id || index;
    }

    private loadHomeData() {
        this.isLoading.set(true);
        this.homeService.getHomeData().subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    const data: HomeDataDto = res.data;

                    this.offers.set(data.exclusiveOffers.map(o => ({
                        title: o.title,
                        desc: o.description,
                        image: o.imageUrl,
                        link: o.linkUrl
                    })));

                    this.shopByItems.set(data.shopByItems.map(s => ({
                        name: s.title,
                        image: s.imageUrl,
                        link: s.linkUrl
                    })));

                    this.categories.set(data.categories.map(c => ({
                        id: c.id,
                        name: c.name,
                        slug: c.slug,
                        image: c.imageUrl,
                        count: `${c.products?.length || 0} Products`,
                        products: (c.products || []).map((p: HomeProduct) => ({
                            ...p,
                            categoryName: c.name
                        }))
                    })));

                    const allProducts: any[] = [];
                    data.categories.forEach((cat: any) => {
                        if (cat.products) {
                            allProducts.push(...cat.products.map((p: HomeProduct) => ({
                                id: p.id,
                                slug: p.slug,
                                name: p.name,
                                minPrice: p.minPrice,
                                maxPrice: p.maxPrice,
                                discountPercentage: p.discountPercentage,
                                imageUrl: p.imageUrl,
                                categoryName: p.categoryName || cat.name,
                                averageRating: p.averageRating || 0,
                                reviewCount: p.reviewCount || 0,
                                isInWishlist: p.isInWishlist
                            })));
                        }
                    });

                    this.featuredProducts.set(allProducts.slice(0, 8));
                    this.startSlideTimer();
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

    private loadFeaturedCollections() {
        this.collectionService.getCollectionsList(1, 5).subscribe({
            next: (res) => {
                const items = res?.data || res?.items || [];
                this.featuredCollections.set(items);

                if (items.length > 0) {
                    this.carouselOffers.set(items.map((c: any, i: number) => ({
                        title: c.name,
                        desc: c.description || 'Exclusive bundle with special pricing',
                        image: c.imageUrl,
                        slug: c.slug,
                        priceNow: c.priceNow,
                        originalPrice: c.originalPrice,
                        bg: i % 2 === 0
                            ? 'linear-gradient(45deg, #0f172a, #1e293b)'
                            : 'linear-gradient(45deg, #c5a059, #b48e43)'
                    })));

                    this.currentSlide.set(0);
                    this.startSlideTimer();
                    setTimeout(() => this.showFlashOfferToast(), 2000);
                }
                this.cdr.markForCheck();
            },
            error: () => {
                this.cdr.markForCheck();
            }
        });
    }

    private showFlashOfferToast() {
        if (this.carouselOffers().length === 0) return;
        this.flashOffer.set(this.carouselOffers()[0]);
        this.showFlashToast.set(true);

        setTimeout(() => {
            this.flashToastVisible.set(true);
            this.flashToastStartTime = Date.now();
            this.flashToastRemaining = 8000;
            this.cdr.markForCheck();
        }, 300);

        this.flashToastTimer = setTimeout(() => {
            this.dismissFlashToast();
        }, 8000);
    }

    pauseFlashToast() {
        if (this.isFlashToastPaused()) return;
        this.isFlashToastPaused.set(true);
        clearTimeout(this.flashToastTimer);

        const elapsed = Date.now() - this.flashToastStartTime;
        this.flashToastRemaining -= elapsed;
        this.cdr.markForCheck();
    }

    resumeFlashToast() {
        if (!this.isFlashToastPaused()) return;
        this.isFlashToastPaused.set(false);
        this.flashToastStartTime = Date.now();

        this.flashToastTimer = setTimeout(() => {
            this.dismissFlashToast();
        }, this.flashToastRemaining);
        this.cdr.markForCheck();
    }

    dismissFlashToast(event?: Event) {
        if (event) event.stopPropagation();
        clearTimeout(this.flashToastTimer);
        this.flashToastVisible.set(false);
        setTimeout(() => {
            this.showFlashToast.set(false);
            this.cdr.markForCheck();
        }, 500);
        this.cdr.markForCheck();
    }

    goToFlashOffer() {
        const offer = this.flashOffer();
        if (offer?.slug) {
            this.dismissFlashToast();
            this.router.navigate(['/collections', offer.slug]);
        }
    }

    startSlideTimer() {
        this.stopSlideTimer();
        if (isPlatformBrowser(this.platformId) && this.carouselOffers().length > 1) {
            this.slideInterval = setInterval(() => {
                this.ngZone.run(() => {
                    this.nextSlide();
                    this.cdr.markForCheck();
                });
            }, 5000);
        }
    }

    stopSlideTimer() {
        if (this.slideInterval) clearInterval(this.slideInterval);
    }

    setSlide(index: number) {
        this.currentSlide.set(index);
        this.startSlideTimer();
    }

    nextSlide() {
        const offers = this.carouselOffers();
        if (offers.length > 0) {
            this.currentSlide.set((this.currentSlide() + 1) % offers.length);
        }
    }

    initParallax() {
        this.ngZone.runOutsideAngular(() => {
            this.parallaxListener = (e: MouseEvent) => {
                const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
                const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
                const visual = document.querySelector('.hero-visual') as HTMLElement;
                if (visual) visual.style.transform = `translate(${moveX}px, ${moveY}px)`;
                document.querySelectorAll('.moving-element').forEach((el, i) => {
                    const speed = (i + 1) * 0.5;
                    (el as HTMLElement).style.transform = `translate(${-moveX * speed}px, ${-moveY * speed}px)`;
                });
            };
            window.addEventListener('mousemove', this.parallaxListener as any);
        });
    }

    scrollToSection(sectionId: string) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    addToCart(product: { id: number; name: string; price: number; image: string }) {
        this.cartService.addToCart(product);
        this.router.navigate(['/cart']);
    }

    subscribeNewsletter(email: string) {
        if (!email || !email.includes('@')) {
            this.toastService.error('Please enter a valid email address.');
            return;
        }

        this.homeService.subscribe(email).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success('Subscribed successfully! Welcome to Elite.');
                } else {
                    this.toastService.error(res.error?.message || 'Subscription failed.');
                }
                this.cdr.markForCheck();
            },
            error: () => {
                this.toastService.error('Connection error. Please try again later.');
                this.cdr.markForCheck();
            }
        });
    }

    stats = [
        { value: '5000+', label: 'Happy Customers', icon: 'ri-user-smile-fill' },
        { value: '1500+', label: 'Exclusive Products', icon: 'ri-home-heart-fill' },
        { value: '24h', label: 'Home Delivery', icon: 'ri-truck-fill' },
        { value: '100%', label: 'Quality Warranty', icon: 'ri-verified-badge-fill' }
    ];

    testimonials = [
        { name: 'Ahmed Mahmoud', comment: 'Quality of wood is amazing and delivery was perfectly on time.', avatar: 'ri-user-3-line' },
        { name: 'Sarah Hassan', comment: 'The Iranian carpet is a piece of art in my home, thank you Elite Store.', avatar: 'ri-user-heart-line' },
        { name: 'Mohamed Ali', comment: 'The best place to buy modern furniture in Egypt without competition.', avatar: 'ri-user-star-line' }
    ];

    activeHotspot = signal<number | null>(null);
    toggleHotspot(id: number | null) {
        this.activeHotspot.set(this.activeHotspot() === id ? null : id);
    }

    getIconForCategory(category: string): string {
        switch (category.toLowerCase()) {
            case 'furniture': return 'ri-armchair-line';
            case 'carpets': return 'ri-grid-line';
            case 'furnishings': return 'ri-t-shirt-2-line';
            default: return 'ri-home-line';
        }
    }

    scrollContainer(element: HTMLElement, direction: number) {
        if (element && element.firstElementChild) {
            const cardWidth = (element.firstElementChild as HTMLElement).offsetWidth;
            const gap = 24;
            const scrollAmount = (cardWidth + gap) * direction;
            element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            setTimeout(() => this.cdr.markForCheck(), 400);
        }
    }

    canScrollLeft(element: HTMLElement): boolean {
        if (!element) return false;
        return element.scrollLeft > 0;
    }

    canScrollRight(element: HTMLElement): boolean {
        if (!element) return false;
        return element.scrollLeft + element.clientWidth < element.scrollWidth - 1;
    }
}
