import { Component, HostListener, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../pages/public/cart/services/cart.service';
import { WishlistService } from '../../pages/public/wishlist/services/wishlist.service';
import { StoreService } from '../../core/services/store.service';


@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    public authService = inject(AuthService);
    public cartService = inject(CartService);
    public wishlistService = inject(WishlistService);
    public storeService = inject(StoreService);
    isScrolled = false;
    isNavHidden = false;
    lastScrollTop = 0;
    isMobileMenuOpen = signal(false);
    isCategoriesMenuOpen = signal(false);
    activeCategory = signal<number | null>(null);

    offers = [
        { title: 'End of Season Sale', code: 'WINTER50' },
        { title: 'Limited Time Free Shipping', code: 'FREE20' },
        { title: 'Handmade Carpet Offers', code: 'CARPET10' }
    ];

    ngOnInit() {
        this.cartService.loadFromBackend();
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        const currentScroll = window.scrollY;

        // Scrolled state
        this.isScrolled = currentScroll > 50;

        // Hide/Show logic
        // Hide/Show logic
        if (this.isMobileMenuOpen()) {
            this.isNavHidden = false;
        } else if (currentScroll > this.lastScrollTop && currentScroll > 100) {
            // Scroll Down
            this.isNavHidden = true;
        } else {
            // Scroll Up
            this.isNavHidden = false;
        }

        this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
    }

    toggleCategoriesMenu(event?: Event) {
        if (event) {
            event.stopPropagation();
        }
        const newState = !this.isCategoriesMenuOpen();
        this.isCategoriesMenuOpen.set(newState);

        // Reset active category when menu is opened or closed
        if (newState || !newState) {
            this.activeCategory.set(null);
        }
    }

    setActiveCategory(id: number | null) {
        this.activeCategory.set(id);
    }

    @HostListener('document:click', ['$event'])
    closeMenus(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.cat-dropdown-wrapper')) {
            this.isCategoriesMenuOpen.set(false);
        }
    }
}
