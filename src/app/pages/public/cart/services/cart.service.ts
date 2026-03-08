import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private http = inject(HttpClient);
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

    // Add item to cart
    addToCart(product: { id: any; name: string; price: number; image: string }, quantity: number = 1) {
        const currentItems = this.cartItems();
        const existingItem = currentItems.find(item => item.id === product.id);

        if (existingItem) {
            // Increase quantity
            this.cartItems.set(
                currentItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            );
        } else {
            // Add new item
            this.cartItems.set([...currentItems, { ...product, quantity }]);
        }

        // Save to localStorage
        this.saveToLocalStorage();
    }

    // Remove item from cart
    removeFromCart(productId: number) {
        this.cartItems.set(this.cartItems().filter(item => item.id !== productId));
        this.saveToLocalStorage();
    }

    // Update quantity
    updateQuantity(productId: number, quantity: number) {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        this.cartItems.set(
            this.cartItems().map(item =>
                item.id === productId
                    ? { ...item, quantity }
                    : item
            )
        );
        this.saveToLocalStorage();
    }

    // Clear cart
    clearCart() {
        this.cartItems.set([]);
        this.saveToLocalStorage();
    }

    // Save to localStorage
    private saveToLocalStorage() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify(this.cartItems()));
        }
    }

    // Load from localStorage
    loadFromLocalStorage() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cart');
            if (saved) {
                this.cartItems.set(JSON.parse(saved));
            }
        }
    }

    async checkout(data: any): Promise<any> {
        return firstValueFrom(
            this.http.post<any>(`${environment.apiUrl}/cart/checkout`, data)
        );
    }

    async getActiveGateways(): Promise<any> {
        return firstValueFrom(
            this.http.get<any>(`${environment.apiUrl}/payments/list`)
        );
    }
}
