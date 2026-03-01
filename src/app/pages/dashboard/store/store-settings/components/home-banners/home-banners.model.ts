export interface HomePageBanner {
    id: number;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    linkUrl?: string;
    displayOrder: number;
    isActive: boolean;
}
