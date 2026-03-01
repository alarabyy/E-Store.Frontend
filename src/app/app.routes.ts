import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public/public.layout';
import { AuthLayout } from './layouts/auth/auth.layout';
import { DashboardLayoutComponent } from './layouts/dashboard/dashboard.layout';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    // Public Routes (Lazy Loaded)
    {
        path: '',
        component: PublicLayoutComponent,
        loadChildren: () => import('./routes/public.routes').then(m => m.PUBLIC_ROUTES)
    },

    // Auth Routes (Lazy Loaded)
    {
        path: 'auth',
        loadChildren: () => import('./routes/auth.routes').then(m => m.AUTH_ROUTES)
    },

    // Dashboard Routes (Lazy Loaded)
    {
        path: 'dashboard',
        component: DashboardLayoutComponent,
        canActivate: [adminGuard],
        loadChildren: () => import('./routes/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
    },

    // Fallback for undefined routes
    { path: '**', redirectTo: '' }
];
