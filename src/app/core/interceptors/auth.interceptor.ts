import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    let authReq = req;
    const token = authService.getToken();

    if (token) {
        authReq = addToken(req, token);
    }

    return next(authReq).pipe(
        catchError(error => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                // Skip if it's the login or refresh request itself causing 401
                if (req.url.includes('auth/login') || req.url.includes('auth/refresh-token')) {
                    return throwError(() => error);
                }
                return handle401Error(authReq, next, authService);
            }
            return throwError(() => error);
        })
    );
};

function addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
}

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        const refreshToken = authService.getRefreshToken();

        if (refreshToken) {
            return authService.refreshToken(refreshToken).pipe(
                switchMap((response: any) => {
                    isRefreshing = false;
                    // The refreshToken method in authService already calls setSession,
                    // so we can just grab the new token from the service or the response.
                    // Assuming response.data contains the AuthResponse.
                    const newToken = response.data?.accessToken || authService.getToken();
                    if (!newToken) {
                        authService.logout();
                        return throwError(() => new Error('Refresh failed'));
                    }
                    refreshTokenSubject.next(newToken);
                    return next(addToken(request, newToken));
                }),
                catchError((err) => {
                    isRefreshing = false;
                    authService.logout();
                    return throwError(() => err);
                })
            );
        } else {
            isRefreshing = false;
            authService.logout();
            return throwError(() => new Error('No refresh token available'));
        }
    } else {
        return refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(jwt => {
                return next(addToken(request, jwt!));
            })
        );
    }
}
