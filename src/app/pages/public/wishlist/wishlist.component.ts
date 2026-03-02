import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from './services/wishlist.service';
import { CartService } from '../cart/services/cart.service';
import { UrlPipe } from '../../../components/pipes/url.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { SeoService } from '../../../core/services/seo.service';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { Product } from '../catalog/models/product.model';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [CommonModule, RouterLink, ProductCardComponent],
    templateUrl: './wishlist.component.html',
    styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
    wishlistService = inject(WishlistService);
    cartService = inject(CartService);
    toastService = inject(ToastService);
    seoService = inject(SeoService);

    // Computed signal to map WishlistItems to Product format for ProductCardComponent
    mappedProducts = computed(() => {
        return this.wishlistService.items().map(item => {
            return {
                id: item.id,
                name: item.name,
                slug: item.slug || item.id.toString(),
                minPrice: item.price,
                maxPrice: item.price,
                categoryName: item.categoryName || 'Saved Item',
                imageUrl: item.image,
                averageRating: item.averageRating || 0,
                // defaults to satisfy interface
                description: '',
                isActive: true,
                isFeatured: false,
                totalStock: 10,
                reviewCount: 0,
                viewCount: 0,
                totalSold: 0
            } as Product;
        });
    });

    ngOnInit() {
        this.seoService.setSeoData({
            title: 'Your Wishlist',
            description: 'Save your favorite products for later. Keep track of what you love and buy them when you are ready.',
            keywords: 'wishlist, favorite products, save for later, e-store'
        });
        this.wishlistService.loadFromBackend();
    }
}
