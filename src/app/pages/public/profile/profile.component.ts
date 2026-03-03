import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProfileService } from './profile.service';
import { AuthService } from '../../auth/services/auth.service';
import { UserProfileDto } from './profile.models';
import { environment } from '../../../../environments/environment';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { SeoService } from '../../../core/seo/services/seo.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterLink, LoaderComponent],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    profile: UserProfileDto | null = null;
    isLoading = true; // Start with loading
    isOwner = false;
    error: string | null = null;

    private profileService = inject(ProfileService);
    public authService = inject(AuthService);
    private route = inject(ActivatedRoute);
    private seoService = inject(SeoService);

    ngOnInit() {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
        this.route.params.subscribe(params => {
            this.isLoading = true;
            this.error = null;
            const username = params['username'];

            if (username) {
                this.loadProfile(username);
            } else if (this.authService.isAuthenticated()) {
                this.loadMyProfile();
            } else {
                this.error = 'Please login to view your profile';
                this.isLoading = false;
                this.profile = null;
            }
        });
    }

    loadMyProfile() {
        const currentUsername = this.authService.getUsername();
        if (!currentUsername) {
            this.error = 'Please login to view your profile';
            this.isLoading = false;
            return;
        }

        // Check cache
        const cached = (this.profileService as any).profileSubject?.value;
        if (cached && this.authService.getUserId() === cached.id) {
            this.profile = cached;
            this.updateOwnership();
            this.isLoading = false;
        }

        this.profileService.getProfile(currentUsername).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.profile = res.data;
                    this.updateOwnership();
                    this.scrollToTop();
                } else {
                    this.error = res.error?.message || 'Profile not found';
                }
                this.isLoading = false;
            },
            error: (err) => {
                this.error = 'Failed to load your profile';
                this.isLoading = false;
                console.error(err);
            }
        });
    }

    loadProfile(username: string) {
        // Try to load from cache first for "Instant" feel
        const cachedProfile = (this.profileService as any).profileSubject?.value;
        if (cachedProfile && (cachedProfile.email === username || cachedProfile.email.split('@')[0] === username)) {
            this.profile = cachedProfile;
            this.updateOwnership();
            this.isLoading = false; // We have data, but we'll still fetch fresh in background
            this.scrollToTop();
        } else {
            this.isLoading = true;
            this.profile = null; // Clear if no cache
        }

        this.profileService.getProfile(username).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.profile = res.data;
                    this.updateOwnership();
                    this.scrollToTop();
                } else {
                    this.error = res.error?.message || 'Profile not found';
                }
                this.isLoading = false;
            },
            error: (err) => {
                this.error = 'Error loading profile';
                this.isLoading = false;
                console.error(err);
            }
        });
    }

    private scrollToTop() {
        if (typeof window !== 'undefined') {
            setTimeout(() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }, 100);
        }
    }

    private updateOwnership() {
        if (!this.profile) return;
        const currentUsername = this.authService.getUsername();
        const currentUserId = this.authService.getUserId();
        this.isOwner = (currentUserId > 0 && this.profile.id === currentUserId) ||
            (!!currentUsername && (this.profile.email === currentUsername || this.profile.email.split('@')[0] === currentUsername));

        this.seoService.setSeoData({
            title: `${this.profile.firstName} ${this.profile.lastName} - Profile`,
            description: `View the profile of ${this.profile.firstName} ${this.profile.lastName} on E-Store.`,
            keywords: `profile, ${this.profile.firstName}, ${this.profile.lastName}, e-store user`,
            image: this.profile.avatarUrl ? this.resolveImageUrl(this.profile.avatarUrl) : undefined,
            type: 'profile'
        });
    }

    getInitials(firstName: string, lastName: string): string {
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }

    resolveImageUrl(url: string | undefined): string {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Fix double slashes and ensure backendUrl is used
        const baseUrl = environment.backendUrl.endsWith('/') ? environment.backendUrl.slice(0, -1) : environment.backendUrl;
        const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${normalizedUrl}`;
    }

}
