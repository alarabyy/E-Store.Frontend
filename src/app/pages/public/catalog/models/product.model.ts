export interface Product {
    id: number;
    name: string;
    slug: string;
    summary?: string;
    description: string;
    minPrice: number;
    maxPrice: number;
    discountPercentage?: number;
    categoryName: string;
    imageUrl: string;
    isActive: boolean;
    isFeatured: boolean;
    totalStock: number;
    averageRating: number;
    reviewCount: number;
    viewCount: number;
    totalSold: number;
    images?: ProductImage[];
    variants?: ProductVariant[];
    attributes?: ProductAttributeValue[];

    // UI Only Properties
    imagesList?: string[];
    price?: number;
    oldPrice?: number | null;
    rating?: number;
    reviewsCount?: number;
    stockLevel?: number;
    deliveryEstimate?: string;
}

export interface ProductImage {
    id: number;
    imageUrl: string;
}

export interface ProductVariant {
    id: number;
    name: string;
    sku: string;
    price: number;
    salePrice?: number;
    stockQuantity: number;
    imageUrl?: string;
}

export interface ProductAttributeValue {
    id: number;
    attributeName: string;
    value: string;
}
