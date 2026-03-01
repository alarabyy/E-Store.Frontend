import { Component, Input, inject, ViewChild, ElementRef, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../pages/public/catalog/models/product.model';
import { CartService } from '../../pages/public/cart/services/cart.service';
import { WishlistService } from '../../pages/public/wishlist/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductService } from '../../pages/public/catalog/services/product.service';
import { UrlPipe } from '../pipes/url.pipe';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, UrlPipe, DecimalPipe],
    templateUrl: './product-card.component.html',
    styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnDestroy, AfterViewInit {
    cartService = inject(CartService);
    wishlistService = inject(WishlistService);
    productService = inject(ProductService);
    toastService = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);

    @Input() product!: Product;
    @Input() categoryName: string = '';
    @ViewChild('quickViewOverlay') quickViewOverlay!: ElementRef<HTMLDivElement>;

    // Quick View State
    isQuickViewOpen = false;
    isLoadingProduct = false;
    quickViewProduct: Product | null = null;
    activeImage: string = '';
    quantity: number = 1;
    selectedVariant: any = null;

    addToCart(event: Event) {
        event.stopPropagation();
        this.cartService.addToCart({
            id: this.product.id,
            name: this.product.name,
            price: this.product.minPrice,
            image: this.product.imageUrl
        });
        this.toastService.success('Item added to cart successfully!');
    }

    toggleWishlist(event: Event) {
        event.stopPropagation();
        this.wishlistService.toggleWishlist({
            id: this.product.id,
            name: this.product.name,
            price: this.product.minPrice,
            image: this.product.imageUrl
        });
    }

    ngAfterViewInit() {
        // Move overlay to body immediately to avoid Angular change detection issues with moved DOM nodes later
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

        this.isQuickViewOpen = true;
        this.isLoadingProduct = true;

        // Force detection since we rely on template elements for visibility
        this.cdr.detectChanges();

        if (this.quickViewOverlay && this.quickViewOverlay.nativeElement) {
            this.quickViewOverlay.nativeElement.style.display = 'flex';
        }

        this.productService.getProductBySlug(this.product.slug).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.quickViewProduct = res.data;
                    this.activeImage = res.data.imageUrl;
                    if (res.data.variants && res.data.variants.length > 0) {
                        this.selectedVariant = res.data.variants[0];
                    }
                }
                this.isLoadingProduct = false;
                this.cdr.detectChanges(); // Ensure the modal UI renders the data
            },
            error: () => {
                this.isLoadingProduct = false;
                this.toastService.error('Failed to load product details.');
                this.closeQuickView();
                this.cdr.detectChanges();
            }
        });
    }

    closeQuickView() {
        this.isQuickViewOpen = false;
        this.isLoadingProduct = false;
        this.quickViewProduct = null;
        this.quantity = 1;

        try {
            if (this.quickViewOverlay && this.quickViewOverlay.nativeElement) {
                this.quickViewOverlay.nativeElement.style.display = 'none';
            }
        } catch (e) { }
        this.cdr.detectChanges();
    }

    ngOnDestroy() {
        try {
            if (this.quickViewOverlay && this.quickViewOverlay.nativeElement) {
                const overlay = this.quickViewOverlay.nativeElement;
                if (overlay.parentElement === document.body) {
                    overlay.remove();
                }
            }
        } catch (e) { }
    }

    setActiveImage(img: string) {
        this.activeImage = img;
    }

    selectVariant(variant: any) {
        this.selectedVariant = variant;
        if (variant.imageUrl) {
            this.activeImage = variant.imageUrl;
        }
    }

    addQuickToCart() {
        if (!this.quickViewProduct) return;

        this.cartService.addToCart({
            id: this.quickViewProduct.id,
            name: this.quickViewProduct.name,
            price: this.selectedVariant ? (this.selectedVariant.salePrice || this.selectedVariant.price) : this.quickViewProduct.minPrice,
            image: this.selectedVariant?.imageUrl || this.quickViewProduct.imageUrl,
            variantId: this.selectedVariant?.id
        }, this.quantity);
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
}
