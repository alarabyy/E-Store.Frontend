import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/public/home/home';

export const PUBLIC_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('../pages/public/home/home').then(m => m.HomeComponent)
    },
    {
        path: 'catalog',
        loadComponent: () => import('../pages/public/catalog/catalog.component').then(m => m.CatalogComponent)
    },
    {
        path: 'wishlist',
        loadComponent: () => import('../pages/public/wishlist/wishlist.component').then(m => m.WishlistComponent)
    },
    {
        path: 'support',
        loadComponent: () => import('../pages/public/support/support.component').then(m => m.SupportComponent)
    },
    {
        path: 'cart',
        loadComponent: () => import('../pages/public/cart/cart.component').then(m => m.CartComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('../pages/public/profile/profile.component').then(m => m.ProfileComponent)
    },
    {
        path: 'profile/:username',
        loadComponent: () => import('../pages/public/profile/profile.component').then(m => m.ProfileComponent)
    },
    {
        path: 'settings/profile',
        loadComponent: () => import('../pages/public/profile/edit-profile/edit-profile.component').then(m => m.EditProfileComponent)
    },
    {
        path: 'my-orders',
        loadComponent: () => import('../pages/public/my-orders/my-orders.component').then(m => m.MyOrdersComponent)
    },
    {
        path: 'product/:slug',
        loadComponent: () => import('../pages/public/product-details/product-details.component').then(m => m.ProductDetailsComponent)
    },
    {
        path: 'collections/:slug',
        loadComponent: () => import('../pages/public/collection-details/collection-details.component').then(m => m.CollectionDetailsComponent)
    },
    {
        path: 'categories/:slug',
        loadComponent: () => import('../pages/public/category-details/category-details.component').then(m => m.CategoryDetailsComponent)
    }
];
