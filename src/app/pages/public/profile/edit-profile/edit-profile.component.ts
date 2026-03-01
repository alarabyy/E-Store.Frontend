import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService } from '../profile.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { UserProfileDto } from '../profile.models';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-edit-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
    profileForm: FormGroup;
    isLoading = false;
    isSaving = false;
    avatarFile: File | null = null;
    coverFile: File | null = null;
    avatarPreview: string | null = null;
    coverPreview: string | null = null;

    private fb = inject(FormBuilder);
    private profileService = inject(ProfileService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    constructor() {
        this.profileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            bio: [''],
            jobTitle: [''],
            country: [''],
            city: [''],
            phoneNumber: ['']
        });
    }

    ngOnInit() {
        this.loadCurrentProfile();
    }

    loadCurrentProfile() {
        this.isLoading = true;

        const currentUsername = this.authService.getUsername();
        if (!currentUsername) {
            this.isLoading = false;
            this.toastService.error('Please login to edit your profile');
            this.router.navigate(['/']);
            return;
        }

        // Try to load from cache first for "Instant" feel
        const cachedProfile = (this.profileService as any).profileSubject?.value;
        if (cachedProfile) {
            this.patchForm(cachedProfile);
            this.isLoading = false; // No spinner if we have cache
        }

        this.profileService.getProfile(currentUsername).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.patchForm(res.data);
                }
                this.isLoading = false;
            },
            error: () => {
                this.toastService.error('Failed to load profile');
                this.isLoading = false;
            }
        });
    }

    private patchForm(d: UserProfileDto) {
        this.profileForm.patchValue({
            firstName: d.firstName,
            lastName: d.lastName,
            bio: d.bio,
            jobTitle: d.jobTitle,
            country: d.country,
            city: d.city,
            phoneNumber: d.phoneNumber
        });
        this.avatarPreview = d.avatarUrl ? this.resolveImageUrl(d.avatarUrl) : null;
        this.coverPreview = d.coverImageUrl ? this.resolveImageUrl(d.coverImageUrl) : null;
    }

    resolveImageUrl(url: string | undefined): string {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const baseUrl = environment.backendUrl.endsWith('/') ? environment.backendUrl.slice(0, -1) : environment.backendUrl;
        const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${normalizedUrl}`;
    }

    onAvatarChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.avatarFile = file;
            const reader = new FileReader();
            reader.onload = () => this.avatarPreview = reader.result as string;
            reader.readAsDataURL(file);
        }
    }

    onCoverChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.coverFile = file;
            const reader = new FileReader();
            reader.onload = () => this.coverPreview = reader.result as string;
            reader.readAsDataURL(file);
        }
    }

    onSubmit() {
        if (this.profileForm.invalid) return;

        this.isSaving = true;
        const formData = new FormData();
        const val = this.profileForm.value;

        Object.keys(val).forEach(key => {
            if (val[key]) formData.append(key, val[key]);
        });

        if (this.avatarFile) formData.append('avatar', this.avatarFile);
        if (this.coverFile) formData.append('coverImage', this.coverFile);

        this.profileService.updateProfile(formData).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success('Profile updated successfully');
                    this.router.navigate(['/profile']);
                } else {
                    this.toastService.error(res.error?.message || 'Update failed');
                }
                this.isSaving = false;
            },
            error: (err) => {
                this.toastService.error('Error updating profile');
                this.isSaving = false;
                console.error(err);
            }
        });
    }
}
