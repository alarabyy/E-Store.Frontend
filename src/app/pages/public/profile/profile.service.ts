import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserProfileDto, UserProfileResponse } from './profile.models';
import { ApiResponse } from '../../../components/models/api-response.model';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private apiUrl = `${environment.apiUrl}/users`;
    private http = inject(HttpClient);

    private profileSubject = new BehaviorSubject<UserProfileDto | null>(null);
    public profile$ = this.profileSubject.asObservable();

    getProfile(username: string): Observable<UserProfileResponse> {
        // Use encodeURIComponent to handle characters like @ in email-usernames
        const encodedUsername = encodeURIComponent(username);
        return this.http.get<UserProfileResponse>(`${this.apiUrl}/profile/${encodedUsername}`).pipe(
            tap(res => {
                if (res.isSuccess && res.data) {
                    this.profileSubject.next(res.data);
                }
            })
        );
    }

    getMe(): Observable<UserProfileResponse> {
        return this.http.get<UserProfileResponse>(`${this.apiUrl}/me`).pipe(
            tap(res => {
                if (res.isSuccess && res.data) {
                    this.profileSubject.next(res.data);
                }
            })
        );
    }

    updateProfile(formData: FormData): Observable<ApiResponse<void>> {
        return this.http.put<ApiResponse<void>>(`${this.apiUrl}/me/update-profile`, formData).pipe(
            tap(res => {
                if (res.isSuccess) {
                    // We don't have the new profile data here, but we can clear the cache 
                    // or the next getProfile will refresh it.
                }
            })
        );
    }

    clearCache() {
        this.profileSubject.next(null);
    }
}
