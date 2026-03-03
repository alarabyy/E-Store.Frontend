import { Injectable, inject, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PublicStoreInfo, StoreSettings, CategoryTreeMinimal, HomePageBanner, ExclusiveOffer, ShopByItem } from '../models/store.models';

@Injectable({
    providedIn: 'root'
})
export class StoreService {
    private http = inject(HttpClient);
    private doc = inject(DOCUMENT);
    private apiUrl = `${environment.apiUrl}/store`;

    private storeInfoSubject = new BehaviorSubject<PublicStoreInfo | null>(null);
    public storeInfo$ = this.storeInfoSubject.asObservable();

    private settingsSubject = new BehaviorSubject<StoreSettings | null>(null);
    public settings$ = this.settingsSubject.asObservable();

    private categoriesSubject = new BehaviorSubject<CategoryTreeMinimal[]>([]);
    public categories$ = this.categoriesSubject.asObservable();

    private bannersSubject = new BehaviorSubject<HomePageBanner[]>([]);
    public banners$ = this.bannersSubject.asObservable();

    private offersSubject = new BehaviorSubject<ExclusiveOffer[]>([]);
    public offers$ = this.offersSubject.asObservable();

    private itemsSubject = new BehaviorSubject<ShopByItem[]>([]);
    public items$ = this.itemsSubject.asObservable();

    constructor() {
        this.loadStoreInfo();
    }

    public loadStoreInfo(): void {
        this.http.get<ApiResponse<PublicStoreInfo>>(`${this.apiUrl}/info`).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.storeInfoSubject.next(res.data);
                    this.settingsSubject.next(res.data.settings);
                    this.categoriesSubject.next(res.data.categories);
                    this.bannersSubject.next(res.data.homeBanners || []);
                    this.offersSubject.next(res.data.exclusiveOffers || []);
                    this.itemsSubject.next(res.data.shopByItems || []);

                    this.applyThemeColors(res.data.settings);
                }
            },
            error: (err) => console.error('Failed to load store info', err)
        });
    }

    get settings(): StoreSettings | null {
        return this.settingsSubject.value;
    }

    get categories(): CategoryTreeMinimal[] {
        return this.categoriesSubject.value;
    }

    private applyThemeColors(settings: StoreSettings): void {
        const doc = this.doc;
        if (!doc) return;

        const root = doc.documentElement;

        // Button Colors
        if (settings.buttonPrimaryColor) root.style.setProperty('--button-primary-color', settings.buttonPrimaryColor);
        if (settings.buttonPrimaryTextColor) root.style.setProperty('--button-primary-text-color', settings.buttonPrimaryTextColor);
        if (settings.buttonPrimaryHoverColor) root.style.setProperty('--button-primary-hover-color', settings.buttonPrimaryHoverColor);
        if (settings.buttonSecondaryColor) root.style.setProperty('--button-secondary-color', settings.buttonSecondaryColor);
        if (settings.buttonSecondaryTextColor) root.style.setProperty('--button-secondary-text-color', settings.buttonSecondaryTextColor);
        if (settings.buttonSecondaryHoverColor) root.style.setProperty('--button-secondary-hover-color', settings.buttonSecondaryHoverColor);
        if (settings.buttonSuccessColor) root.style.setProperty('--button-success-color', settings.buttonSuccessColor);
        if (settings.buttonSuccessTextColor) root.style.setProperty('--button-success-text-color', settings.buttonSuccessTextColor);
        if (settings.buttonDangerColor) root.style.setProperty('--button-danger-color', settings.buttonDangerColor);
        if (settings.buttonDangerTextColor) root.style.setProperty('--button-danger-text-color', settings.buttonDangerTextColor);
        if (settings.buttonWarningColor) root.style.setProperty('--button-warning-color', settings.buttonWarningColor);
        if (settings.buttonWarningTextColor) root.style.setProperty('--button-warning-text-color', settings.buttonWarningTextColor);
        if (settings.buttonInfoColor) root.style.setProperty('--button-info-color', settings.buttonInfoColor);
        if (settings.buttonInfoTextColor) root.style.setProperty('--button-info-text-color', settings.buttonInfoTextColor);
        if (settings.buttonDisabledColor) root.style.setProperty('--button-disabled-color', settings.buttonDisabledColor);
        if (settings.buttonDisabledTextColor) root.style.setProperty('--button-disabled-text-color', settings.buttonDisabledTextColor);

        // Text Colors
        if (settings.textPrimaryColor) root.style.setProperty('--text-primary-color', settings.textPrimaryColor);
        if (settings.textSecondaryColor) root.style.setProperty('--text-secondary-color', settings.textSecondaryColor);
        if (settings.textMutedColor) root.style.setProperty('--text-muted-color', settings.textMutedColor);
        if (settings.textHeadingColor) root.style.setProperty('--text-heading-color', settings.textHeadingColor);
        if (settings.textBodyColor) root.style.setProperty('--text-body-color', settings.textBodyColor);
        if (settings.textLinkColor) root.style.setProperty('--text-link-color', settings.textLinkColor);
        if (settings.textLinkHoverColor) root.style.setProperty('--text-link-hover-color', settings.textLinkHoverColor);
        if (settings.textErrorColor) root.style.setProperty('--text-error-color', settings.textErrorColor);
        if (settings.textSuccessColor) root.style.setProperty('--text-success-color', settings.textSuccessColor);

        // Background Colors
        if (settings.backgroundPrimaryColor) root.style.setProperty('--background-primary-color', settings.backgroundPrimaryColor);
        if (settings.backgroundSecondaryColor) root.style.setProperty('--background-secondary-color', settings.backgroundSecondaryColor);
        if (settings.backgroundCardColor) root.style.setProperty('--background-card-color', settings.backgroundCardColor);
        if (settings.backgroundSectionColor) root.style.setProperty('--background-section-color', settings.backgroundSectionColor);
        if (settings.backgroundOverlayColor) root.style.setProperty('--background-overlay-color', settings.backgroundOverlayColor);
        if (settings.backgroundDarkColor) root.style.setProperty('--background-dark-color', settings.backgroundDarkColor);

        // Border Colors
        if (settings.borderPrimaryColor) root.style.setProperty('--border-primary-color', settings.borderPrimaryColor);
        if (settings.borderSecondaryColor) root.style.setProperty('--border-secondary-color', settings.borderSecondaryColor);
        if (settings.borderInputColor) root.style.setProperty('--border-input-color', settings.borderInputColor);
        if (settings.borderInputFocusColor) root.style.setProperty('--border-input-focus-color', settings.borderInputFocusColor);
        if (settings.borderCardColor) root.style.setProperty('--border-card-color', settings.borderCardColor);
        if (settings.borderErrorColor) root.style.setProperty('--border-error-color', settings.borderErrorColor);
        if (settings.borderSuccessColor) root.style.setProperty('--border-success-color', settings.borderSuccessColor);

        // Input Colors
        if (settings.inputBackgroundColor) root.style.setProperty('--input-background-color', settings.inputBackgroundColor);
        if (settings.inputBorderColor) root.style.setProperty('--input-border-color', settings.inputBorderColor);
        if (settings.inputFocusColor) root.style.setProperty('--input-focus-color', settings.inputFocusColor);
        if (settings.inputPlaceholderColor) root.style.setProperty('--input-placeholder-color', settings.inputPlaceholderColor);
        if (settings.inputTextColor) root.style.setProperty('--input-text-color', settings.inputTextColor);
        if (settings.inputErrorColor) root.style.setProperty('--input-error-color', settings.inputErrorColor);
        if (settings.inputDisabledBackgroundColor) root.style.setProperty('--input-disabled-background-color', settings.inputDisabledBackgroundColor);
        if (settings.inputDisabledTextColor) root.style.setProperty('--input-disabled-text-color', settings.inputDisabledTextColor);

        // Navigation Colors
        if (settings.navigationBackgroundColor) root.style.setProperty('--navigation-background-color', settings.navigationBackgroundColor);
        if (settings.navigationTextColor) root.style.setProperty('--navigation-text-color', settings.navigationTextColor);
        if (settings.navigationActiveColor) root.style.setProperty('--navigation-active-color', settings.navigationActiveColor);
        if (settings.navigationActiveTextColor) root.style.setProperty('--navigation-active-text-color', settings.navigationActiveTextColor);
        if (settings.navigationHoverColor) root.style.setProperty('--navigation-hover-color', settings.navigationHoverColor);
        if (settings.navigationHoverTextColor) root.style.setProperty('--navigation-hover-text-color', settings.navigationHoverTextColor);

        // Header Colors
        if (settings.headerBackgroundColor) root.style.setProperty('--header-background-color', settings.headerBackgroundColor);
        if (settings.headerTextColor) root.style.setProperty('--header-text-color', settings.headerTextColor);
        if (settings.headerBorderColor) root.style.setProperty('--header-border-color', settings.headerBorderColor);

        // Footer Colors
        if (settings.footerBackgroundColor) root.style.setProperty('--footer-background-color', settings.footerBackgroundColor);
        if (settings.footerTextColor) root.style.setProperty('--footer-text-color', settings.footerTextColor);
        if (settings.footerLinkColor) root.style.setProperty('--footer-link-color', settings.footerLinkColor);
        if (settings.footerLinkHoverColor) root.style.setProperty('--footer-link-hover-color', settings.footerLinkHoverColor);

        // Badge & Tag Colors
        if (settings.badgePrimaryColor) root.style.setProperty('--badge-primary-color', settings.badgePrimaryColor);
        if (settings.badgePrimaryTextColor) root.style.setProperty('--badge-primary-text-color', settings.badgePrimaryTextColor);
        if (settings.badgeSuccessColor) root.style.setProperty('--badge-success-color', settings.badgeSuccessColor);
        if (settings.badgeSuccessTextColor) root.style.setProperty('--badge-success-text-color', settings.badgeSuccessTextColor);
        if (settings.badgeDangerColor) root.style.setProperty('--badge-danger-color', settings.badgeDangerColor);
        if (settings.badgeDangerTextColor) root.style.setProperty('--badge-danger-text-color', settings.badgeDangerTextColor);
        if (settings.badgeWarningColor) root.style.setProperty('--badge-warning-color', settings.badgeWarningColor);
        if (settings.badgeWarningTextColor) root.style.setProperty('--badge-warning-text-color', settings.badgeWarningTextColor);

        // Alert Colors
        if (settings.alertSuccessBackgroundColor) root.style.setProperty('--alert-success-background-color', settings.alertSuccessBackgroundColor);
        if (settings.alertSuccessTextColor) root.style.setProperty('--alert-success-text-color', settings.alertSuccessTextColor);
        if (settings.alertSuccessBorderColor) root.style.setProperty('--alert-success-border-color', settings.alertSuccessBorderColor);
        if (settings.alertErrorBackgroundColor) root.style.setProperty('--alert-error-background-color', settings.alertErrorBackgroundColor);
        if (settings.alertErrorTextColor) root.style.setProperty('--alert-error-text-color', settings.alertErrorTextColor);
        if (settings.alertErrorBorderColor) root.style.setProperty('--alert-error-border-color', settings.alertErrorBorderColor);
        if (settings.alertWarningBackgroundColor) root.style.setProperty('--alert-warning-background-color', settings.alertWarningBackgroundColor);
        if (settings.alertWarningTextColor) root.style.setProperty('--alert-warning-text-color', settings.alertWarningTextColor);
        if (settings.alertWarningBorderColor) root.style.setProperty('--alert-warning-border-color', settings.alertWarningBorderColor);
        if (settings.alertInfoBackgroundColor) root.style.setProperty('--alert-info-background-color', settings.alertInfoBackgroundColor);
        if (settings.alertInfoTextColor) root.style.setProperty('--alert-info-text-color', settings.alertInfoTextColor);
        if (settings.alertInfoBorderColor) root.style.setProperty('--alert-info-border-color', settings.alertInfoBorderColor);

        // Legacy Colors (for backward compatibility)
        if (settings.primaryColor) {
            root.style.setProperty('--primary-color', settings.primaryColor);
            if (!settings.buttonPrimaryColor) root.style.setProperty('--button-primary-color', settings.primaryColor);
        }
        if (settings.secondaryColor) {
            root.style.setProperty('--secondary-color', settings.secondaryColor);
            if (!settings.buttonSecondaryColor) root.style.setProperty('--button-secondary-color', settings.secondaryColor);
        }
        if (settings.accentColor) {
            root.style.setProperty('--accent-color', settings.accentColor);
        }
        if (settings.backgroundColor) {
            root.style.setProperty('--background-color', settings.backgroundColor);
            root.style.setProperty('--bg-color', settings.backgroundColor);
            if (!settings.backgroundPrimaryColor) root.style.setProperty('--background-primary-color', settings.backgroundColor);
        }
        if (settings.textColor) {
            root.style.setProperty('--text-color', settings.textColor);
            if (!settings.textPrimaryColor) root.style.setProperty('--text-primary-color', settings.textColor);
        }
    }
}
