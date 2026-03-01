import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../components/models/api-response.model';
import { CartItem } from '../models/cart.model';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthModalService } from '../../../../core/services/auth-modal.service';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private apiUrl = `${environment.apiUrl}/cart`;
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private authModalService = inject(AuthModalService);
    private cartItems = signal<CartItem[]>([]);

    // Expose as readonly signal
    items = this.cartItems.asReadonly();

    // Get total count
    get itemCount(): number {
        return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
    }

    // Get total price
    get totalPrice(): number {
        return this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    constructor() { }

    // ── Add item to cart ──────────────────────────────────────────────────────────
    async addToCart(product: { id: any; name: string; price: number; image: string, variantId?: number }, quantity: number = 1) {
        if (!this.authService.isAuthenticated()) {
            this.authModalService.showRequireLoginModal();
            return;
        }

        try {
            await firstValueFrom(this.http.post(`${this.apiUrl}/items/add`, {
                productId: product.id,
                productVariantId: product.variantId,
                quantity: quantity
            }));
            this.loadFromBackend();
        } catch (err) {
            console.error('Cart sync failed:', err);
            throw err;
        }
    }

    // ── Remove item from cart ─────────────────────────────────────────────────────
    async removeFromCart(productId: number) {
        const item = this.cartItems().find(i => i.id === productId);
        if (!item) return;

        try {
            await firstValueFrom(this.http.delete(`${this.apiUrl}/items/${(item as any).cartItemId || item.id}/remove`));
            this.loadFromBackend();
        } catch (err) {
            console.error('Remove from cart failed:', err);
            throw err;
        }
    }

    // ── Update quantity ───────────────────────────────────────────────────────────
    async updateQuantity(productId: number, quantity: number) {
        if (quantity <= 0) {
            return this.removeFromCart(productId);
        }

        const item = this.cartItems().find(i => i.id === productId);
        if (!item) return;

        try {
            await firstValueFrom(this.http.patch(`${this.apiUrl}/items/${(item as any).cartItemId || item.id}/update-quantity`, { quantity }));
            this.loadFromBackend();
        } catch (err) {
            console.error('Update quantity failed:', err);
            throw err;
        }
    }

    // ── Clear cart ────────────────────────────────────────────────────────────────
    async clearCart() {
        try {
            await firstValueFrom(this.http.delete(`${this.apiUrl}/clear`));
            this.cartItems.set([]);
        } catch (err) {
            console.error('Clear cart failed:', err);
            throw err;
        }
    }

    // ── Checkout ──────────────────────────────────────────────────────────────────
    async checkout(payload: {
        currency: string;
        country: string;
        idempotencyKey: string;
        shippingAddress: any;
        billingAddress: any;
        paymentDetails: Record<string, string>;
    }): Promise<any> {
        try {
            const result = await firstValueFrom(
                this.http.post<any>(`${this.apiUrl}/checkout`, payload)
            );
            if (result?.isSuccess) {
                this.cartItems.set([]);
            }
            return result;
        } catch (err: any) {
            console.error('Checkout failed:', err);
            throw err;
        }
    }

    // ── Load from backend ─────────────────────────────────────────────────────────
    loadFromBackend() {
        this.http.get<ApiResponse<any>>(this.apiUrl).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data && res.data.items) {
                    const mapped = res.data.items.map((i: any) => ({
                        cartItemId: i.id,
                        id: i.productId,
                        name: i.productName,
                        price: i.unitPrice,
                        image: i.productImageUrl,
                        quantity: i.quantity,
                        variantName: i.variantName || null
                    }));
                    this.cartItems.set(mapped);
                } else {
                    this.cartItems.set([]);
                }
            },
            error: () => this.cartItems.set([])
        });
    }
}
