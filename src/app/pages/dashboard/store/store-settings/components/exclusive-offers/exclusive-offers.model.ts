export interface ExclusiveOffer {
    id: number;
    title: string;
    description?: string;
    imageUrl?: string;
    linkUrl?: string;
    displayOrder: number;
    isActive: boolean;
}
