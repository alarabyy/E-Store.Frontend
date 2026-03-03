import { Component, inject, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeneralInfoService } from './general-info.service';
import { ToastService } from '../../../../../../components/toast/services/toast.service';
import { StoreSettings } from './general-info.model';
import { ApiResponse } from '../../../../../../core/api/models/api-response.model';
import { UrlPipe } from '../../../../../../components/pipes/url.pipe';
import { environment } from '../../../../../../../environments/environment';

@Component({
    selector: 'app-general-info',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UrlPipe],
    templateUrl: './general-info.component.html',
    styleUrl: './general-info.component.scss'
})
export class GeneralInfoComponent implements OnChanges {
    @Input() settings: StoreSettings | null = null;

    settingsForm: FormGroup;
    isSaving = false;

    // File handling
    logoFile: File | null = null;
    secondaryLogoFile: File | null = null;
    faviconFile: File | null = null;

    // Previews
    logoPreview: string | null = null;
    secondaryLogoPreview: string | null = null;
    faviconPreview: string | null = null;

    private generalInfoService = inject(GeneralInfoService);
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);

    constructor() {
        this.settingsForm = this.fb.group({
            storeName: ['', [Validators.required, Validators.minLength(3)]],
            catchPhrase: [''],
            contactEmails: this.fb.array([]),
            contactPhoneNumbers: this.fb.array([]),
            addresses: this.fb.array([]),
            facebookUrl: [''],
            instagramUrl: [''],
            twitterUrl: [''],
            linkedInUrl: [''],
            aboutSection: [''],
            storeLogoUrl: [''],
            storeSecondaryLogoUrl: [''],
            faviconUrl: [''],
            primaryColor: ['#1e40af'],
            secondaryColor: ['#3b82f6'],
            accentColor: ['#f59e0b'],
            backgroundColor: ['#ffffff'],
            textColor: ['#1f2937']
        });
    }

    get contactEmails() { return this.settingsForm.get('contactEmails') as any; }
    get contactPhoneNumbers() { return this.settingsForm.get('contactPhoneNumbers') as any; }
    get addresses() { return this.settingsForm.get('addresses') as any; }

    addEmail(email = '') { this.contactEmails.push(this.fb.control(email, [Validators.email])); }
    removeEmail(index: number) { this.contactEmails.removeAt(index); }

    addPhone(phone = '') { this.contactPhoneNumbers.push(this.fb.control(phone)); }
    removePhone(index: number) { this.contactPhoneNumbers.removeAt(index); }

    addAddress(address = '') { this.addresses.push(this.fb.control(address)); }
    removeAddress(index: number) { this.addresses.removeAt(index); }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['settings'] && this.settings) {
            // Clear arrays first
            while (this.contactEmails.length) this.contactEmails.removeAt(0);
            while (this.contactPhoneNumbers.length) this.contactPhoneNumbers.removeAt(0);
            while (this.addresses.length) this.addresses.removeAt(0);

            // Add new values
            this.settings.contactEmails?.forEach(e => this.addEmail(e));
            this.settings.contactPhoneNumbers?.forEach(p => this.addPhone(p));
            this.settings.addresses?.forEach(a => this.addAddress(a));

            // Default one if empty
            if (this.contactEmails.length === 0) this.addEmail();
            if (this.contactPhoneNumbers.length === 0) this.addPhone();
            if (this.addresses.length === 0) this.addAddress();

            this.settingsForm.patchValue(this.settings);
            this.logoPreview = this.settings.storeLogoUrl || null;
            this.secondaryLogoPreview = this.settings.storeSecondaryLogoUrl || null;
            this.faviconPreview = this.settings.faviconUrl || null;
        }
    }

    onFileSelected(event: any, type: string): void {
        const file = event.target.files[0];
        if (file) {
            if (type === 'logo') {
                this.logoFile = file;
                const reader = new FileReader();
                reader.onload = () => this.logoPreview = reader.result as string;
                reader.readAsDataURL(file);
            } else if (type === 'secondaryLogo') {
                this.secondaryLogoFile = file;
                const reader = new FileReader();
                reader.onload = () => this.secondaryLogoPreview = reader.result as string;
                reader.readAsDataURL(file);
            } else if (type === 'favicon') {
                this.faviconFile = file;
                const reader = new FileReader();
                reader.onload = () => this.faviconPreview = reader.result as string;
                reader.readAsDataURL(file);
            }
        }
    }

    onSubmit(): void {
        if (this.settingsForm.invalid) {
            this.settingsForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const formData = new FormData();
        const val = this.settingsForm.value;

        // Brand Identity
        formData.append('StoreName', val.storeName);
        if (val.catchPhrase) formData.append('CatchPhrase', val.catchPhrase);
        if (val.aboutSection) formData.append('AboutSection', val.aboutSection);

        // Contact info (Arrays)
        val.contactEmails?.forEach((email: string) => {
            if (email) formData.append('ContactEmails', email);
        });
        val.contactPhoneNumbers?.forEach((phone: string) => {
            if (phone) formData.append('ContactPhoneNumbers', phone);
        });
        val.addresses?.forEach((addr: string) => {
            if (addr) formData.append('Addresses', addr);
        });

        // Social Links
        if (val.facebookUrl) formData.append('FacebookUrl', val.facebookUrl);
        if (val.instagramUrl) formData.append('InstagramUrl', val.instagramUrl);
        if (val.twitterUrl) formData.append('TwitterUrl', val.twitterUrl);
        if (val.linkedInUrl) formData.append('LinkedInUrl', val.linkedInUrl);

        // Colors
        if (val.primaryColor) formData.append('PrimaryColor', val.primaryColor);
        if (val.secondaryColor) formData.append('SecondaryColor', val.secondaryColor);
        if (val.accentColor) formData.append('AccentColor', val.accentColor);
        if (val.backgroundColor) formData.append('BackgroundColor', val.backgroundColor);
        if (val.textColor) formData.append('TextColor', val.textColor);

        // Files
        if (this.logoFile) formData.append('StoreLogo', this.logoFile);
        if (this.secondaryLogoFile) formData.append('StoreSecondaryLogo', this.secondaryLogoFile);
        if (this.faviconFile) formData.append('Favicon', this.faviconFile);

        this.generalInfoService.updateSettings(formData).subscribe({
            next: (res: ApiResponse<any>) => {
                if (res.isSuccess) {
                    this.toastService.success('Store settings updated successfully');
                } else {
                    this.toastService.error(res.error?.message || 'Failed to update settings');
                }
                this.isSaving = false;
            },
            error: (err: any) => {
                this.isSaving = false;
                const msg = err?.error?.error?.message || err?.error?.message || 'Failed to update settings';
                this.toastService.error(msg);
                console.error(err);
            }
        });
    }

    isInvalid(controlName: string): boolean {
        const control = this.settingsForm.get(controlName);
        return !!(control && control.invalid && control.touched);
    }
}
