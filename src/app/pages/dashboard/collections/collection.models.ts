export interface Collection {
    id: number;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    priceNow?: number;
    originalPrice?: number;
    isActive: boolean;
    displayOrder: number;
    metaTitle?: string;
    metaDescription?: string;
    productCount: number;
    products?: any[];
}

export interface CreateCollectionRequest {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: File | string | null;
    priceNow?: number;
    originalPrice?: number;
    isActive: boolean;
    displayOrder: number;
    metaTitle?: string;
    metaDescription?: string;
}

export interface UpdateCollectionRequest {
    id: number;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: File | string | null;
    priceNow?: number;
    originalPrice?: number;
    isActive: boolean;
    displayOrder: number;
    metaTitle?: string;
    metaDescription?: string;
}

export interface ManageCollectionProductsRequest {
    collectionId: number;
    productIds: number[];
}

