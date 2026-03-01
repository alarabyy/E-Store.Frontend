export interface WishlistItem {
    id: number;
    name: string;
    price: number;
    image: string;
    slug?: string;
    categoryName?: string;
    averageRating?: number;
    variantId?: number;
}
