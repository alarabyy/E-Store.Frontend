export interface StoreSettings {
    id: number;
    storeName: string;
    storeLogoUrl?: string;
    storeSecondaryLogoUrl?: string;
    faviconUrl?: string;
    catchPhrase?: string;
    contactEmails?: string[];
    contactPhoneNumbers?: string[];
    addresses?: string[];
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    linkedInUrl?: string;
    aboutSection?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
}

export interface UpdateStoreSettingsRequest {
    storeName: string;
    storeLogo?: File;
    storeSecondaryLogo?: File;
    favicon?: File;
    catchPhrase?: string;
    contactEmails?: string[];
    contactPhoneNumbers?: string[];
    addresses?: string[];
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    linkedInUrl?: string;
    aboutSection?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
}
