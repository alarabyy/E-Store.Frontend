import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../product.service';
import { Product, ProductVariant } from '../product.models';
import { UrlPipe } from '../../../../components/pipes/url.pipe';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [CommonModule, RouterModule, UrlPipe],
    templateUrl: './product-details.component.html',
    styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private productService = inject(ProductService);

    product: Product | null = null;
    selectedVariant: ProductVariant | null = null;
    isLoading = true;
    error: string | null = null;
    activeImage: string | null = null;

    ngOnInit(): void {
        const state = history.state;
        if (state && state.product) {
            this.product = state.product;
            this.isLoading = false;
            if (this.product && this.product.variants && this.product.variants.length > 0) {
                this.selectVariant(this.product.variants[0]);
            } else if (this.product && this.product.images && this.product.images.length > 0) {
                this.activeImage = this.product.images[0].imageUrl;
            }
        }

        this.route.paramMap.subscribe(params => {
            const slug = params.get('slug');
            if (slug) {
                this.loadProduct(slug);
            } else {
                this.error = 'Product not found';
                this.isLoading = false;
            }
        });
    }

    loadProduct(slug: string): void {
        // Only set loading to true if we don't have product data from state
        if (!this.product) {
            this.isLoading = true;
        }

        this.productService.getProductBySlug(slug)
            .subscribe({
                next: (res) => {
                    this.isLoading = false;
                    if (res.isSuccess && res.data) {
                        this.product = res.data;
                        // Reset selection only if strictly needed, or just update data
                        if (this.product.variants && this.product.variants.length > 0) {
                            // If we already have a selected variant, try to find it in the new data
                            const currentId = this.selectedVariant?.id;
                            const updatedVariant = this.product.variants.find(v => v.id === currentId);
                            this.selectVariant(updatedVariant || this.product.variants[0]);
                        } else if (this.product.images && this.product.images.length > 0) {
                            this.activeImage = this.product.images[0].imageUrl;
                        }
                    } else if (!this.product) {
                        // Only show error if we haven't rendered anything yet
                        this.error = 'Failed to load product details';
                    }
                },
                error: (err) => {
                    this.isLoading = false;
                    if (!this.product) {
                        this.error = err?.error?.message || 'An error occurred while fetching product details';
                    }
                }
            });
    }

    selectVariant(variant: ProductVariant): void {
        this.selectedVariant = variant;
        if (variant.imageUrl) {
            this.activeImage = variant.imageUrl;
        } else if (this.product && this.product.images.length > 0) {
            this.activeImage = this.product.images[0].imageUrl;
        }
    }

    setActiveImage(url: string): void {
        this.activeImage = url;
    }

    getTotalStock(): number {
        if (!this.product?.variants) return 0;
        return this.product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
    }

    hasDiscount(): boolean {
        if (this.selectedVariant) {
            return !!(this.selectedVariant.salePrice && this.selectedVariant.salePrice < this.selectedVariant.price);
        }
        if (!this.product) return false;
        if (this.product.discountPercentage && this.product.discountPercentage > 0) return true;
        return this.product.variants?.some(v => v.salePrice && v.salePrice < v.price) || false;
    }

    getDisplayPrice(): number {
        if (this.selectedVariant) {
            return this.selectedVariant.salePrice || this.selectedVariant.price;
        }
        return this.product?.minPrice || 0;
    }

    getOriginalPrice(): number | null {
        if (this.selectedVariant && this.selectedVariant.salePrice && this.selectedVariant.salePrice < this.selectedVariant.price) {
            return this.selectedVariant.price;
        }
        return null;
    }
}
