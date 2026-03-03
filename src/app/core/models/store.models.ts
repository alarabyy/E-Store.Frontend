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
    
    // Button Colors
    buttonPrimaryColor?: string;
    buttonPrimaryTextColor?: string;
    buttonPrimaryHoverColor?: string;
    buttonSecondaryColor?: string;
    buttonSecondaryTextColor?: string;
    buttonSecondaryHoverColor?: string;
    buttonSuccessColor?: string;
    buttonSuccessTextColor?: string;
    buttonDangerColor?: string;
    buttonDangerTextColor?: string;
    buttonWarningColor?: string;
    buttonWarningTextColor?: string;
    buttonInfoColor?: string;
    buttonInfoTextColor?: string;
    buttonDisabledColor?: string;
    buttonDisabledTextColor?: string;
    
    // Text Colors
    textPrimaryColor?: string;
    textSecondaryColor?: string;
    textMutedColor?: string;
    textHeadingColor?: string;
    textBodyColor?: string;
    textLinkColor?: string;
    textLinkHoverColor?: string;
    textErrorColor?: string;
    textSuccessColor?: string;
    
    // Background Colors
    backgroundPrimaryColor?: string;
    backgroundSecondaryColor?: string;
    backgroundCardColor?: string;
    backgroundSectionColor?: string;
    backgroundOverlayColor?: string;
    backgroundDarkColor?: string;
    
    // Border Colors
    borderPrimaryColor?: string;
    borderSecondaryColor?: string;
    borderInputColor?: string;
    borderInputFocusColor?: string;
    borderCardColor?: string;
    borderErrorColor?: string;
    borderSuccessColor?: string;
    
    // Input Colors
    inputBackgroundColor?: string;
    inputBorderColor?: string;
    inputFocusColor?: string;
    inputPlaceholderColor?: string;
    inputTextColor?: string;
    inputErrorColor?: string;
    inputDisabledBackgroundColor?: string;
    inputDisabledTextColor?: string;
    
    // Navigation Colors
    navigationBackgroundColor?: string;
    navigationTextColor?: string;
    navigationActiveColor?: string;
    navigationActiveTextColor?: string;
    navigationHoverColor?: string;
    navigationHoverTextColor?: string;
    
    // Header Colors
    headerBackgroundColor?: string;
    headerTextColor?: string;
    headerBorderColor?: string;
    
    // Footer Colors
    footerBackgroundColor?: string;
    footerTextColor?: string;
    footerLinkColor?: string;
    footerLinkHoverColor?: string;
    
    // Badge & Tag Colors
    badgePrimaryColor?: string;
    badgePrimaryTextColor?: string;
    badgeSuccessColor?: string;
    badgeSuccessTextColor?: string;
    badgeDangerColor?: string;
    badgeDangerTextColor?: string;
    badgeWarningColor?: string;
    badgeWarningTextColor?: string;
    
    // Alert Colors
    alertSuccessBackgroundColor?: string;
    alertSuccessTextColor?: string;
    alertSuccessBorderColor?: string;
    alertErrorBackgroundColor?: string;
    alertErrorTextColor?: string;
    alertErrorBorderColor?: string;
    alertWarningBackgroundColor?: string;
    alertWarningTextColor?: string;
    alertWarningBorderColor?: string;
    alertInfoBackgroundColor?: string;
    alertInfoTextColor?: string;
    alertInfoBorderColor?: string;
    
    // Legacy Colors (for backward compatibility)
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
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
    
    // Button Colors
    buttonPrimaryColor?: string;
    buttonPrimaryTextColor?: string;
    buttonPrimaryHoverColor?: string;
    buttonSecondaryColor?: string;
    buttonSecondaryTextColor?: string;
    buttonSecondaryHoverColor?: string;
    buttonSuccessColor?: string;
    buttonSuccessTextColor?: string;
    buttonDangerColor?: string;
    buttonDangerTextColor?: string;
    buttonWarningColor?: string;
    buttonWarningTextColor?: string;
    buttonInfoColor?: string;
    buttonInfoTextColor?: string;
    buttonDisabledColor?: string;
    buttonDisabledTextColor?: string;
    
    // Text Colors
    textPrimaryColor?: string;
    textSecondaryColor?: string;
    textMutedColor?: string;
    textHeadingColor?: string;
    textBodyColor?: string;
    textLinkColor?: string;
    textLinkHoverColor?: string;
    textErrorColor?: string;
    textSuccessColor?: string;
    
    // Background Colors
    backgroundPrimaryColor?: string;
    backgroundSecondaryColor?: string;
    backgroundCardColor?: string;
    backgroundSectionColor?: string;
    backgroundOverlayColor?: string;
    backgroundDarkColor?: string;
    
    // Border Colors
    borderPrimaryColor?: string;
    borderSecondaryColor?: string;
    borderInputColor?: string;
    borderInputFocusColor?: string;
    borderCardColor?: string;
    borderErrorColor?: string;
    borderSuccessColor?: string;
    
    // Input Colors
    inputBackgroundColor?: string;
    inputBorderColor?: string;
    inputFocusColor?: string;
    inputPlaceholderColor?: string;
    inputTextColor?: string;
    inputErrorColor?: string;
    inputDisabledBackgroundColor?: string;
    inputDisabledTextColor?: string;
    
    // Navigation Colors
    navigationBackgroundColor?: string;
    navigationTextColor?: string;
    navigationActiveColor?: string;
    navigationActiveTextColor?: string;
    navigationHoverColor?: string;
    navigationHoverTextColor?: string;
    
    // Header Colors
    headerBackgroundColor?: string;
    headerTextColor?: string;
    headerBorderColor?: string;
    
    // Footer Colors
    footerBackgroundColor?: string;
    footerTextColor?: string;
    footerLinkColor?: string;
    footerLinkHoverColor?: string;
    
    // Badge & Tag Colors
    badgePrimaryColor?: string;
    badgePrimaryTextColor?: string;
    badgeSuccessColor?: string;
    badgeSuccessTextColor?: string;
    badgeDangerColor?: string;
    badgeDangerTextColor?: string;
    badgeWarningColor?: string;
    badgeWarningTextColor?: string;
    
    // Alert Colors
    alertSuccessBackgroundColor?: string;
    alertSuccessTextColor?: string;
    alertSuccessBorderColor?: string;
    alertErrorBackgroundColor?: string;
    alertErrorTextColor?: string;
    alertErrorBorderColor?: string;
    alertWarningBackgroundColor?: string;
    alertWarningTextColor?: string;
    alertWarningBorderColor?: string;
    alertInfoBackgroundColor?: string;
    alertInfoTextColor?: string;
    alertInfoBorderColor?: string;
    
    // Legacy Colors (for backward compatibility)
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
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
