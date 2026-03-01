import { Component, OnInit, inject, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../catalog/services/product.service';
import { CartService } from '../cart/services/cart.service';
import { WishlistService } from '../wishlist/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';
import { UrlPipe } from '../../../components/pipes/url.pipe';
import { environment } from '../../../../environments/environment';
import { SeoService } from '../../../core/services/seo.service';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, UrlPipe],
    templateUrl: './product-details.component.html',
    styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private productService = inject(ProductService);
    private cartService = inject(CartService);
    public wishlistService = inject(WishlistService);
    private toastService = inject(ToastService);
    private seoService = inject(SeoService);

    product: any = null;
    activeImage = '';
    quantity: number = 1;
    activeTab: string = 'details';
    selectedVariant: any = null;


    // Data arrays
    reviews: any[] = [];
    relatedProducts: any[] = [];
    starCounts: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    starPercentages: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    // Review form
    newReview = { rating: 5, title: '', comment: '' };
    isSubmittingReview = false;

    // Zoom feature
    isZoomOpen = false;
    zoomLevel = 1;
    zoomTranslateX = 0;
    zoomTranslateY = 0;
    private isDragging = false;
    private dragStartX = 0;
    private dragStartY = 0;
    private dragOffsetX = 0;
    private dragOffsetY = 0;

    // Action feedback state
    isAddingToCart = false;
    cartAdded = false;

    // Delivery & Urgency
    deliveryDateString = '';
    countdownTimer = '';
    private timerInterval: any;

    ngOnInit() {
        this.route.params.subscribe((params: any) => {
            const slug = params['slug'];
            const nav = this.router.getCurrentNavigation() as any;
            if (nav?.extras.state?.['product']) {
                this.product = nav.extras.state?.['product'];
                this.afterProductLoaded();
            } else if (slug) {
                this.loadProduct(slug);
            }
        });
    }

    ngOnDestroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    loadProduct(slug: string) {
        this.productService.getProductBySlug(slug).subscribe({
            next: (res: any) => {
                if (res.isSuccess && res.data) {
                    this.product = res.data;
                    this.afterProductLoaded();
                }
            }
        });
    }

    private afterProductLoaded() {
        if (this.product) {
            const pageTitle = this.product.seotitle || this.product.name;
            const pageDesc = this.product.metadescription || this.product.summary || `Buy ${this.product.name} at E-Store.`;
            const keywords = this.product.categoryName ? `${this.product.name}, ${this.product.categoryName}, buy online, furniture` : 'buy online, furniture';

            this.seoService.setSeoData({
                title: pageTitle,
                description: pageDesc,
                keywords: keywords,
                image: this.product.imageUrl ? this.getImageUrl(this.product.imageUrl) : undefined,
                type: 'product'
            });
        }

        if (this.product.images && this.product.images.length > 0) {
            this.product.imagesList = this.product.images.map((img: any) => img.imageUrl);
            this.activeImage = this.product.imagesList[0];
        } else {
            this.product.imagesList = [this.product.imageUrl || 'assets/images/image1.png'];
            this.activeImage = this.product.imagesList[0];
        }

        this.product.rating = this.product.averageRating || 0;
        this.product.reviewsCount = this.product.reviewCount || 0;
        this.product.stockLevel = this.product.variants
            ? this.product.variants.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0)
            : 0;

        if (this.product.variants && this.product.variants.length > 0) {
            this.selectedVariant = this.product.variants[0];
            this.updatePriceFromVariant();
            this.product.variants.forEach((v: any) => {
                if (v.imageUrl && !this.product.imagesList.includes(v.imageUrl)) {
                    this.product.imagesList.push(v.imageUrl);
                }
            });
        } else {
            this.product.price = this.product.minPrice || 0;
            this.product.oldPrice = this.product.maxPrice > this.product.minPrice ? this.product.maxPrice : null;
        }

        this.loadReviews();
        this.loadRelatedProducts();

        // Calculate Delivery & Urgency
        const today = new Date();
        const deliveryMs = today.getTime() + (3 * 24 * 60 * 60 * 1000); // 3 days
        const deliveryDate = new Date(deliveryMs);
        this.deliveryDateString = deliveryDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

        this.startCountdown();
    }

    startCountdown() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.updateCountdown();
        this.timerInterval = setInterval(() => {
            this.updateCountdown();
        }, 60000); // update every minute
    }

    updateCountdown() {
        const now = new Date();
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const diffMs = endOfDay.getTime() - now.getTime();

        const hrs = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        this.countdownTimer = `${hrs} hrs ${mins} mins`;
    }

    selectVariant(variant: any) {
        this.selectedVariant = variant;
        if (variant.imageUrl) {
            this.activeImage = variant.imageUrl;
        }
        this.updatePriceFromVariant();
        this.toastService.info(`Switched to: ${variant.name}`);
    }

    private updatePriceFromVariant() {
        if (this.selectedVariant) {
            this.product.price = this.selectedVariant.salePrice || this.selectedVariant.price;
            this.product.oldPrice = this.selectedVariant.salePrice ? this.selectedVariant.price : null;
        }
    }

    loadReviews() {
        if (!this.product?.id) return;
        this.productService.getProductReviews(this.product.id).subscribe({
            next: (res: any) => {
                if (res.isSuccess) {
                    this.reviews = res.data || [];
                    this.calculateStarRatings();
                }
            }
        });
    }

    calculateStarRatings() {
        this.starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        this.reviews.forEach(r => {
            const rounded = Math.round(r.rating);
            if (rounded >= 1 && rounded <= 5) this.starCounts[rounded]++;
        });
        for (let i = 1; i <= 5; i++) {
            this.starPercentages[i] = this.reviews.length
                ? Math.round((this.starCounts[i] / this.reviews.length) * 100)
                : 0;
        }
    }

    loadRelatedProducts() {
        if (!this.product?.categoryName) return;
        this.productService.getProducts(this.product.categoryName).subscribe({
            next: (res: any) => {
                if (res.isSuccess && res.data) {
                    this.relatedProducts = res.data.filter((p: any) => p.id !== this.product.id).slice(0, 4);
                }
            }
        });
    }

    setActiveImage(img: string) {
        this.activeImage = img;
    }

    changeQuantity(delta: number) {
        const newQty = this.quantity + delta;
        if (newQty >= 1 && newQty <= (this.product.stockLevel || 99)) {
            this.quantity = newQty;
        }
    }

    setTab(tab: string) {
        this.activeTab = tab;
    }

    addToCart() {
        if (this.product.stockLevel === 0) return;
        this.isAddingToCart = true;

        this.cartService.addToCart({
            id: this.product.id,
            name: this.product.name + (this.selectedVariant ? ` - ${this.selectedVariant.name}` : ''),
            price: this.product.price,
            image: this.activeImage,
            variantId: this.selectedVariant?.id
        }, this.quantity);

        this.toastService.success(`✓ "${this.product.name}" added to your cart!`);

        setTimeout(() => {
            this.isAddingToCart = false;
            this.cartAdded = true;
            setTimeout(() => this.cartAdded = false, 2000);
        }, 600);
    }

    toggleWishlist() {
        const inWishlist = this.wishlistService.isInWishlist(this.product.id);
        this.wishlistService.toggleWishlist({
            id: this.product.id,
            name: this.product.name,
            price: this.product.minPrice || this.product.price,
            image: this.activeImage
        });
        if (inWishlist) {
            this.toastService.info(`"${this.product.name}" removed from wishlist.`);
        } else {
            this.toastService.success(`❤️ "${this.product.name}" saved to wishlist!`);
        }
    }

    shareProduct() {
        if (typeof window !== 'undefined' && navigator.share) {
            navigator.share({
                title: this.product.name,
                text: this.product.summary || this.product.description,
                url: window.location.href
            }).then(() => {
                this.toastService.success('Product shared successfully!');
            }).catch(() => { });
        } else if (typeof window !== 'undefined') {
            navigator.clipboard?.writeText(window.location.href).then(() => {
                this.toastService.success('🔗 Link copied to clipboard!');
            }).catch(() => {
                this.toastService.info('Copy the link from your address bar.');
            });
        }
    }

    submitReview() {
        if (!this.newReview.title || !this.newReview.comment) {
            this.toastService.error('Please fill in both title and comment.');
            return;
        }

        this.isSubmittingReview = true;
        const reviewData = {
            productId: this.product.id,
            title: this.newReview.title,
            comment: this.newReview.comment,
            rating: this.newReview.rating
        };

        this.productService.createProductReview(reviewData).subscribe({
            next: (res: any) => {
                if (res.isSuccess) {
                    this.toastService.success('⭐ Thank you! Your review has been published.');
                    this.newReview = { rating: 5, title: '', comment: '' };
                    this.loadReviews();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to submit review.');
                }
                this.isSubmittingReview = false;
            },
            error: (err: any) => {
                this.isSubmittingReview = false;
                if (err.error?.error?.message) {
                    this.toastService.error(err.error.error.message);
                } else if (err.status === 401) {
                    this.toastService.error('You must be logged in to post a review.');
                } else {
                    this.toastService.error('An error occurred while submitting your review.');
                }
            }
        });
    }

    // ── Zoom Feature ──────────────────────────────────────────────
    openZoom() {
        this.isZoomOpen = true;
        this.zoomLevel = 1;
        this.zoomTranslateX = 0;
        this.zoomTranslateY = 0;
        document.body.style.overflow = 'hidden';
    }

    closeZoom() {
        this.isZoomOpen = false;
        document.body.style.overflow = '';
    }

    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel + 0.4, 4);
    }

    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel - 0.4, 1);
        if (this.zoomLevel === 1) {
            this.zoomTranslateX = 0;
            this.zoomTranslateY = 0;
        }
    }

    onZoomMouseMove(event: MouseEvent) {
        if (this.isDragging && this.zoomLevel > 1) {
            const dx = event.clientX - this.dragStartX;
            const dy = event.clientY - this.dragStartY;
            this.zoomTranslateX = this.dragOffsetX + dx;
            this.zoomTranslateY = this.dragOffsetY + dy;
        }
    }

    onZoomMouseDown(event: MouseEvent) {
        if (this.zoomLevel > 1) {
            this.isDragging = true;
            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;
            this.dragOffsetX = this.zoomTranslateX;
            this.dragOffsetY = this.zoomTranslateY;
        }
    }

    onZoomMouseUp() {
        this.isDragging = false;
    }

    onZoomWheel(event: WheelEvent) {
        event.preventDefault();
        if (event.deltaY < 0) {
            this.zoomIn();
        } else {
            this.zoomOut();
        }
    }

    getImageUrl(path: string): string {
        if (!path) return 'assets/images/placeholder.png';
        if (path.startsWith('http')) return path;
        return `${environment.backendUrl}/${path}`;
    }

    get discountPercent(): number {
        if (this.product?.oldPrice && this.product?.price) {
            return Math.round((1 - this.product.price / this.product.oldPrice) * 100);
        }
        return 0;
    }
}
