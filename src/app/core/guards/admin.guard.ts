import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAdmin()) {
        return true;
    }

    // Redirect based on auth status
    if (authService.isAuthenticated()) {
        // User is logged in but not admin
        router.navigate(['/']);
    } else {
        // User is not logged in
        router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    }
    return false;
};
