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
}

export interface CategoryTreeMinimal {
    id: number;
    name: string;
    slug: string;
    children: CategoryTreeMinimal[];
}

export interface PublicStoreInfo {
    settings: StoreSettings;
    categories: CategoryTreeMinimal[];
    homeBanners: HomePageBanner[];
    exclusiveOffers: ExclusiveOffer[];
    shopByItems: ShopByItem[];
}

export interface UpdateStoreSettingsRequest {
    storeName: string;
    storeLogoUrl?: string;
    storeSecondaryLogoUrl?: string;
    faviconUrl?: string;
    catchPhrase?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    linkedInUrl?: string;
}

export interface HomePageBanner {
    id: number;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    linkUrl?: string;
    displayOrder: number;
    isActive: boolean;
}

export interface ExclusiveOffer {
    id: number;
    title: string;
    description?: string;
    imageUrl?: string;
    linkUrl?: string;
    displayOrder: number;
    isActive: boolean;
}

export interface ShopByItem {
    id: number;
    title: string;
    imageUrl?: string;
    linkUrl?: string;
    displayOrder: number;
    isActive: boolean;
}

export interface StoreDashboardSettingsResponse {
    settings: StoreSettings;
    homeBanners: HomePageBanner[];
    exclusiveOffers: ExclusiveOffer[];
    shopByItems: ShopByItem[];
}
