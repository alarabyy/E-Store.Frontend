import { Component, Input, Output, EventEmitter, inject, ViewChild, ElementRef, OnDestroy, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../pages/public/catalog/models/product.model';
import { CartService } from '../../pages/public/cart/services/cart.service';
import { WishlistService } from '../../pages/public/wishlist/services/wishlist.service';
import { ToastService } from '../toast/services/toast.service';
import { ProductService } from '../../pages/public/catalog/services/product.service';
import { AuthService } from '../../pages/auth/services/auth.service';
import { UrlPipe } from '../pipes/url.pipe';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, UrlPipe, DecimalPipe],
    templateUrl: './product-card.component.html',
    styleUrls: ['./product-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent implements OnDestroy, AfterViewInit {
    private cartService = inject(CartService);
    public wishlistService = inject(WishlistService);
    private productService = inject(ProductService);
    private toastService = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);
    private authService = inject(AuthService);
    private router = inject(Router);

    @Input() product!: Product;
    @Input() categoryName: string = '';
    @Input() useInternalQuickView: boolean = true;
    @Output() quickView = new EventEmitter<Event>();

    @ViewChild('quickViewOverlay') quickViewOverlay!: ElementRef<HTMLDivElement>;

    // Signals for state
    isQuickViewOpen = signal(false);
    isLoadingProduct = signal(false);
    quickViewProduct = signal<Product | null>(null);
    activeImage = signal('');
    quantity = signal(1);
    selectedVariant = signal<any>(null);

    isAddingToCart = signal(false);
    cartAdded = signal(false);

    addToCart(event: Event) {
        event.stopPropagation();

        if (!this.authService.isAuthenticated()) {
            this.toastService.info('Please log in to add items to your cart. We\'d love to have you with us!', 'Authentication Required');
            this.router.navigate(['/auth/login']);
            return;
        }

        this.isAddingToCart.set(true);

        setTimeout(() => {
            this.cartService.addToCart({
                id: this.product.id,
                name: this.product.name,
                price: this.product.minPrice,
                image: this.displayImage
            });
            this.isAddingToCart.set(false);
            this.cartAdded.set(true);
            this.toastService.success(`✓ "${this.product.name}" added to cart!`);

            setTimeout(() => {
                this.cartAdded.set(false);
                this.cdr.markForCheck();
            }, 2000);
            this.cdr.markForCheck();
        }, 400);
    }

    toggleWishlist(event: Event) {
        event.stopPropagation();

        if (!this.authService.isAuthenticated()) {
            this.toastService.info('Log in to save your favorite items and find them later!', 'Join Us!');
            this.router.navigate(['/auth/login']);
            return;
        }
        this.wishlistService.toggleWishlist({
            id: this.product.id,
            name: this.product.name,
            price: this.product.minPrice,
            image: this.displayImage,
            slug: this.product.slug,
            categoryName: this.categoryName || this.product.categoryName || 'Saved Item',
            averageRating: this.product.averageRating || 0
        });
    }

    ngAfterViewInit() {
        if (this.quickViewOverlay && this.quickViewOverlay.nativeElement) {
            const overlay = this.quickViewOverlay.nativeElement;
            if (overlay.parentElement !== document.body) {
                document.body.appendChild(overlay);
            }
        }
    }

    openQuickView(event: Event) {
        event.stopPropagation();
        event.preventDefault();

        if (!this.useInternalQuickView) {
            this.quickView.emit(event);
            return;
        }

        this.isQuickViewOpen.set(true);
        this.isLoadingProduct.set(true);

        if (this.quickViewOverlay && this.quickViewOverlay.nativeElement) {
            this.quickViewOverlay.nativeElement.style.display = 'flex';
        }

        this.productService.getProductBySlug(this.product.slug).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.quickViewProduct.set(res.data);
                    this.activeImage.set(res.data.imageUrl);
                    if (res.data.variants && res.data.variants.length > 0) {
                        this.selectedVariant.set(res.data.variants[0]);
                    }
                }
                this.isLoadingProduct.set(false);
                this.cdr.markForCheck();
            },
            error: () => {
                this.isLoadingProduct.set(false);
                this.toastService.error('Failed to load product details.');
                this.closeQuickView();
                this.cdr.markForCheck();
            }
        });
    }

    closeQuickView() {
        this.isQuickViewOpen.set(false);
        this.isLoadingProduct.set(false);
        this.quickViewProduct.set(null);
        this.quantity.set(1);

        if (this.quickViewOverlay && this.quickViewOverlay.nativeElement) {
            this.quickViewOverlay.nativeElement.style.display = 'none';
        }
        this.cdr.markForCheck();
    }

    ngOnDestroy() {
        if (this.quickViewOverlay && this.quickViewOverlay.nativeElement) {
            const overlay = this.quickViewOverlay.nativeElement;
            if (overlay.parentElement === document.body) {
                overlay.remove();
            }
        }
    }

    addQuickToCart() {
        if (!this.authService.isAuthenticated()) {
            this.closeQuickView();
            this.toastService.info('Log in to add this item to your cart and complete your purchase.', 'Authentication Required');
            this.router.navigate(['/auth/login']);
            return;
        }

        const prod = this.quickViewProduct();
        if (!prod) return;

        const variant = this.selectedVariant();
        this.cartService.addToCart({
            id: prod.id,
            name: prod.name,
            price: variant ? (variant.salePrice || variant.price) : prod.minPrice,
            image: variant?.imageUrl || this.getProdImage(prod),
            variantId: variant?.id
        } as any, this.quantity());
        this.toastService.success('Added to cart!');
        this.closeQuickView();
    }

    get originalPrice(): number | null {
        if (this.product.discountPercentage && this.product.discountPercentage > 0) {
            return this.product.minPrice / (1 - this.product.discountPercentage / 100);
        }
        if (this.product.maxPrice > this.product.minPrice) {
            return this.product.maxPrice;
        }
        return null;
    }

    get displayImage(): string {
        return this.getProdImage(this.product);
    }

    private getProdImage(prod: Product | null): string {
        if (!prod) return '';
        if (prod.imageUrl) return prod.imageUrl;
        if (prod.images && prod.images.length > 0) return prod.images[0].imageUrl;
        if (prod.imagesList && prod.imagesList.length > 0) return prod.imagesList[0];
        if ((prod as any).image) return (prod as any).image;
        return '';
    }
}
