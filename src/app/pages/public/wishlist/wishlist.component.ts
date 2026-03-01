import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from './services/wishlist.service';
import { CartService } from '../cart/services/cart.service';
import { UrlPipe } from '../../../components/pipes/url.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [CommonModule, RouterLink, UrlPipe],
    templateUrl: './wishlist.component.html',
    styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
    wishlistService = inject(WishlistService);
    cartService = inject(CartService);
    toastService = inject(ToastService);
    seoService = inject(SeoService);

    ngOnInit() {
        this.seoService.setSeoData({
            title: 'Your Wishlist',
            description: 'Save your favorite products for later. Keep track of what you love and buy them when you are ready.',
            keywords: 'wishlist, favorite products, save for later, e-store'
        });
        this.wishlistService.loadFromBackend();
    }

    moveToCart(item: any) {
        this.cartService.addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            variantId: item.variantId
        });
        this.wishlistService.toggleWishlist(item); // Remove from wishlist after adding to cart
        this.toastService.success('Item moved to cart successfully!');
    }
}
