import { Routes } from '@angular/router';


export const DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('../pages/dashboard/overview/overview.component').then(m => m.OverviewComponent)
    },
    {
        path: 'products-analytics',
        loadComponent: () => import('../pages/dashboard/products/analytics/products-analytics.component').then(m => m.ProductsAnalyticsComponent)
    },

    {
        path: 'users',
        loadComponent: () => import('../pages/dashboard/users/users.component').then(m => m.UsersComponent)
    },

    {
        path: 'support-tickets',
        loadComponent: () => import('../pages/dashboard/support-tickets/support-tickets').then(m => m.SupportTicketsDashboardComponent)
    },
    {
        path: 'rules',
        children: [
            {
                path: '',
                loadComponent: () => import('../pages/dashboard/rules/rules-list/rules-list.component').then(m => m.RulesListComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('../pages/dashboard/rules/rule-form/rule-form.component').then(m => m.RuleFormComponent)
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('../pages/dashboard/rules/rule-form/rule-form.component').then(m => m.RuleFormComponent)
            }
        ]
    },
    {
        path: 'faqs',
        loadComponent: () => import('../pages/dashboard/faqs/faqs.component').then(m => m.FaqsComponent)
    },
    {
        path: 'categories',
        children: [
            {
                path: '',
                loadComponent: () => import('../pages/dashboard/categories/categories-list/categories-list.component').then(m => m.CategoriesListComponent)
            },
            {
                path: 'create',
                loadComponent: () => import('../pages/dashboard/categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('../pages/dashboard/categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
            }
        ]
    },
    {
        path: 'collections',
        loadComponent: () => import('../pages/dashboard/collections/collections.component').then(m => m.CollectionsComponent)
    },

    // ── New features ──────────────────────────────────────────────────
    {
        path: 'products',
        children: [
            {
                path: '',
                loadComponent: () => import('../pages/dashboard/products/products.component').then(m => m.ProductsComponent)
            },
            {
                path: ':slug',
                loadComponent: () => import('../pages/dashboard/products/product-details/product-details.component').then(m => m.ProductDetailsComponent)
            }
        ]
    },
    {
        path: 'product-attributes',
        loadComponent: () => import('../pages/dashboard/product-attributes/product-attributes.component').then(m => m.ProductAttributesComponent)
    },
    {
        path: 'product-reviews',
        loadComponent: () => import('../pages/dashboard/product-reviews/product-reviews.component').then(m => m.ProductReviewsComponent)
    },
    {
        path: 'newsletter',
        loadComponent: () => import('../pages/dashboard/newsletter/newsletter.component').then(m => m.NewsletterDashboardComponent)
    },

    {
        path: 'services',
        loadComponent: () => import('../pages/dashboard/service-configurations/service-configurations.component').then(m => m.ServiceConfigurationsComponent)
    },
    {
        path: 'orders',
        children: [
            {
                path: '',
                loadComponent: () => import('../pages/dashboard/orders/orders.component').then(m => m.OrdersComponent)
            },
            {
                path: ':id',
                loadComponent: () => import('../pages/dashboard/orders/order-details/order-details.component').then(m => m.OrderDetailsComponent)
            }
        ]
    },
    {
        path: 'promotions',
        loadComponent: () => import('../pages/dashboard/promotions/promotions.component').then(m => m.PromotionsComponent)
    },
    {
        path: 'store-settings',
        loadComponent: () => import('../pages/dashboard/store/store-settings/store-settings.component').then(m => m.StoreSettingsComponent)
    }
];
