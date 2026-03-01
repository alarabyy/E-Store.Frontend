import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../components/models/api-response.model';
import { WishlistItem } from '../models/wishlist.model';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthModalService } from '../../../../core/services/auth-modal.service';

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    private apiUrl = `${environment.apiUrl}/wishlist`;
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private authModalService = inject(AuthModalService);
    private wishlistItems = signal<WishlistItem[]>([]);

    // Expose as readonly signal
    items = this.wishlistItems.asReadonly();

    // Get total count
    get itemCount(): number {
        return this.wishlistItems().length;
    }

    constructor() {
        this.loadFromBackend();
    }

    // Toggle item (add/remove)
    async toggleWishlist(product: { id: number; name: string; price: number; image: string }) {
        if (!this.authService.isAuthenticated()) {
            this.authModalService.showRequireLoginModal();
            return;
        }

        const isIn = this.isInWishlist(product.id);

        try {
            if (isIn) {
                await firstValueFrom(this.http.delete(`${this.apiUrl}/items/${product.id}`));
                this.wishlistItems.set(this.wishlistItems().filter(item => item.id !== product.id));
            } else {
                await firstValueFrom(this.http.post(`${this.apiUrl}/add`, { productId: product.id }));
                this.wishlistItems.set([...this.wishlistItems(), product]);
            }
        } catch (err) {
            console.error('Wishlist sync failed:', err);
        }
    }

    // Check if item is in wishlist
    isInWishlist(productId: number): boolean {
        return this.wishlistItems().some(item => item.id === productId);
    }

    // Load from backend
    loadFromBackend() {
        this.http.get<ApiResponse<any>>(this.apiUrl).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data && res.data.items) {
                    const mappedItems = res.data.items.map((i: any) => ({
                        id: i.productId,
                        name: i.product?.name || 'Unknown Product',
                        price: i.product?.minPrice || i.product?.price || 0,
                        image: i.product?.images?.[0]?.imageUrl || i.product?.imageUrl || 'assets/images/placeholder.png',
                        categoryName: i.product?.categoryName,
                        slug: i.product?.slug,
                        averageRating: i.product?.averageRating
                    }));
                    this.wishlistItems.set(mappedItems);
                }
            },
            error: (err) => {
                // Usually normal if user is a guest (401 Unauthorized)
            }
        });
    }
}

