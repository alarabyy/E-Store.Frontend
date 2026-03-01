import { Injectable, signal } from '@angular/core';

export interface WishlistItem {
    id: number;
    name: string;
    price: number;
    image: string;
}

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    private wishlistItems = signal<WishlistItem[]>([]);

    // Expose as readonly signal
    items = this.wishlistItems.asReadonly();

    // Get total count
    get itemCount(): number {
        return this.wishlistItems().length;
    }

    // Toggle item (add/remove)
    toggleWishlist(product: { id: number; name: string; price: number; image: string }) {
        const currentItems = this.wishlistItems();
        const existingItem = currentItems.find(item => item.id === product.id);

        if (existingItem) {
            // Remove
            this.wishlistItems.set(currentItems.filter(item => item.id !== product.id));
        } else {
            // Add
            this.wishlistItems.set([...currentItems, product]);
        }

        this.saveToLocalStorage();
    }

    // Check if item is in wishlist
    isInWishlist(productId: number): boolean {
        return this.wishlistItems().some(item => item.id === productId);
    }

    // Save to localStorage
    private saveToLocalStorage() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('wishlist', JSON.stringify(this.wishlistItems()));
        }
    }

    // Load from localStorage
    loadFromLocalStorage() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('wishlist');
            if (saved) {
                this.wishlistItems.set(JSON.parse(saved));
            }
        }
    }
}
