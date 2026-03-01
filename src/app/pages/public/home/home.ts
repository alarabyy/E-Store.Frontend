import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../cart/services/cart.service';
import { WishlistService } from '../wishlist/services/wishlist.service';
import { UrlPipe } from '../../../components/pipes/url.pipe';
import { StoreService } from '../../../core/services/store.service';
import { HomeService, HomeDataDto, HomeProduct } from '../../../core/services/home.service';
import { CollectionService } from '../catalog/services/collection.service';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { SeoService } from '../../../core/services/seo.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink, UrlPipe, ProductCardComponent, LoaderComponent],
    templateUrl: './home.html',
    styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    private cartService = inject(CartService);
    public wishlistService = inject(WishlistService);
    private homeService = inject(HomeService);
    public storeService = inject(StoreService);
    private toastService = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);
    public settings$ = this.storeService.settings$;
    private router = inject(Router);
    private seoService = inject(SeoService);

    // Carousel / Slide Logic
    currentSlide = 0;
    private slideInterval: any;

    // Data from Backend
    carouselOffers: any[] = [];
    offers: any[] = [];
    shopByItems: any[] = [];
    categories: any[] = [];
    featuredProducts: any[] = [];
    featuredCollections: any[] = [];
    isLoading = true;

    // Flash toast
    showFlashToast = false;
    flashToastVisible = false;
    flashOffer: any = null;
    private flashToastTimer: any;

    private collectionService = inject(CollectionService);

    ngOnInit() {
        this.seoService.setSeoData({
            title: 'Home',
            description: 'Discover the best modern furniture, Italian carpets, and classic salon pieces at E-Store. High quality and exclusive tech & decor products tailored for your home.',
            keywords: 'furniture, carpets, decor, e-store, tech partner, modern home design'
        });

        this.loadHomeData();
        this.loadFeaturedCollections();
        this.initParallax();
    }

    ngOnDestroy() {
        this.stopSlideTimer();
        if (this.flashToastTimer) clearTimeout(this.flashToastTimer);
    }

    /** Loads all home page data from the dedicated /home/data endpoint */
    private loadHomeData() {
        this.isLoading = true;
        this.homeService.getHomeData().subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    const data: HomeDataDto = res.data;

                    // User Request: Collections are the primary offers now.
                    // We skip banners to avoid duplicates/flicker.

                    // Map exclusive offers
                    this.offers = data.exclusiveOffers.map(o => ({
                        title: o.title,
                        desc: o.description,
                        image: o.imageUrl,
                        link: o.linkUrl
                    }));

                    // Map shop-by items
                    this.shopByItems = data.shopByItems.map(s => ({
                        name: s.title,
                        image: s.imageUrl,
                        link: s.linkUrl
                    }));

                    // Map categories and keep their products for sectional display
                    this.categories = data.categories.map(c => ({
                        id: c.id,
                        name: c.name,
                        slug: c.slug,
                        image: c.imageUrl,
                        count: `${c.products?.length || 0} Products`,
                        products: (c.products || []).map((p: HomeProduct) => ({
                            ...p,
                            categoryName: c.name
                        }))
                    }));

                    // Flatten and take first 8 products as featured
                    const allProducts: any[] = [];
                    data.categories.forEach(cat => {
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

                    this.featuredProducts = allProducts.slice(0, 8);

                    // Start slider after data loaded
                    this.startSlideTimer();
                }
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    /** Loads featured collections from /collections/list for the home page showcase */
    private loadFeaturedCollections() {
        this.collectionService.getCollectionsList(1, 5).subscribe({
            next: (res) => {
                const items = res?.data || res?.items || [];
                this.featuredCollections = items;

                // User Request: Replace slider data with Collections as "Offers"
                if (items.length > 0) {
                    this.carouselOffers = items.map((c: any, i: number) => ({
                        title: c.name,
                        desc: c.description || 'Exclusive bundle with special pricing',
                        image: c.imageUrl,
                        slug: c.slug,
                        priceNow: c.priceNow,
                        originalPrice: c.originalPrice,
                        bg: i % 2 === 0
                            ? 'linear-gradient(45deg, #0f172a, #1e293b)'
                            : 'linear-gradient(45deg, #c5a059, #b48e43)'
                    }));

                    // Reset slider state
                    this.currentSlide = 0;
                    this.startSlideTimer();
                    this.cdr.detectChanges();

                    // Show flash toast offer notification
                    setTimeout(() => this.showFlashOfferToast(), 2000);
                }
            },
            error: () => { /* collections are optional */ }
        });
    }

    // ── Flash Toast ──────────────────────────────────────────────────────────────
    private showFlashOfferToast() {
        if (this.carouselOffers.length === 0) return;
        this.flashOffer = this.carouselOffers[0];
        this.showFlashToast = true;

        // Slide in after a short delay
        setTimeout(() => {
            this.flashToastVisible = true;
            this.cdr.detectChanges();
        }, 300);

        // Auto dismiss after 8 seconds
        this.flashToastTimer = setTimeout(() => {
            this.dismissFlashToast();
        }, 8000);
    }

    dismissFlashToast(event?: Event) {
        if (event) event.stopPropagation();
        this.flashToastVisible = false;
        setTimeout(() => {
            this.showFlashToast = false;
            this.cdr.detectChanges();
        }, 500);
    }

    goToFlashOffer() {
        if (this.flashOffer?.slug) {
            this.dismissFlashToast();
            this.router.navigate(['/collections', this.flashOffer.slug]);
        }
    }

    // ── Slider Methods ──────────────────────────────────────────────────────────
    startSlideTimer() {
        this.stopSlideTimer();
        if (typeof window !== 'undefined' && this.carouselOffers.length > 1) {
            this.slideInterval = setInterval(() => this.nextSlide(), 5000);
        }
    }

    stopSlideTimer() {
        if (this.slideInterval) clearInterval(this.slideInterval);
    }

    setSlide(index: number) {
        this.currentSlide = index;
        this.startSlideTimer();
    }

    nextSlide() {
        if (this.carouselOffers.length > 0) {
            this.currentSlide = (this.currentSlide + 1) % this.carouselOffers.length;
        }
    }

    // ── Parallax ─────────────────────────────────────────────────────────────────
    initParallax() {
        if (typeof window !== 'undefined') {
            window.addEventListener('mousemove', (e) => {
                const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
                const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
                const visual = document.querySelector('.hero-visual') as HTMLElement;
                if (visual) visual.style.transform = `translate(${moveX}px, ${moveY}px)`;
                document.querySelectorAll('.moving-element').forEach((el, i) => {
                    const speed = (i + 1) * 0.5;
                    (el as HTMLElement).style.transform = `translate(${-moveX * speed}px, ${-moveY * speed}px)`;
                });
            });
        }
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
            },
            error: () => this.toastService.error('Connection error. Please try again later.')
        });
    }

    unsubscribeNewsletter(email: string) {
        if (!email || !email.includes('@')) {
            this.toastService.error('Please enter a valid email address.');
            return;
        }

        this.homeService.unsubscribe(email).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success('Unsubscribed successfully. We will miss you!');
                } else {
                    this.toastService.error(res.error?.message || 'Unsubscription failed.');
                }
            },
            error: () => this.toastService.error('Connection error. Please try again later.')
        });
    }

    // ── Static Data ──────────────────────────────────────────────────────────────
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

    activeHotspot: number | null = null;
    toggleHotspot(id: number | null) {
        this.activeHotspot = this.activeHotspot === id ? null : id;
    }

    getIconForCategory(category: string): string {
        switch (category.toLowerCase()) {
            case 'furniture': return 'ri-armchair-line';
            case 'carpets': return 'ri-grid-line';
            case 'furnishings': return 'ri-t-shirt-2-line';
            default: return 'ri-home-line';
        }
    }
}
