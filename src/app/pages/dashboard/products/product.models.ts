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
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface ProductAttributeValue {
    id: number;
    productId: number;
    attributeId: number;
    attributeName: string;
    value: string;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    summary?: string;
    isActive: boolean;
    isFeatured: boolean;
    categoryId: number;
    categoryName: string;
    images: ProductImage[];
    variants: ProductVariant[];
    attributes: ProductAttributeValue[];
    variantType?: string;
    discountPercentage?: number;
    discountStartDate?: string;
    discountEndDate?: string;
    metaTitle?: string;
    metaDescription?: string;
    averageRating: number;
    reviewCount: number;
    minPrice: number;
    maxPrice: number;
    viewCount: number;
    totalSold: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateProductVariantRequest {
    name: string;
    sku: string;
    price: number;
    salePrice: number | null;
    stockQuantity: number | null;
    imageFile?: File;
    imagePreview?: string;
}

export interface CreateProductRequest {
    name: string;
    slug: string;
    description: string;
    summary?: string;
    categoryId: number;
    isFeatured: boolean;
    images: File[];
    variant: CreateProductVariantRequest;
    variantType?: string;
    discountPercentage?: number;
    discountStartDate?: string;
    discountEndDate?: string;
    metaTitle?: string;
    metaDescription?: string;
    attributes?: CreateProductAttributeRequest[];
}

export interface CreateProductAttributeRequest {
    attributeId: number;
    value: string;
}

export interface UpdateProductVariantRequest {
    id: number | null;
    name: string;
    sku: string;
    price: number;
    salePrice: number | null;
    stockQuantity: number | null;
    isActive: boolean;
    imageFile?: File;
    imagePreview?: string;
    existingImageUrl: string | null;
}

export interface UpdateProductRequest {
    id: number;
    name: string;
    slug: string;
    description: string;
    summary?: string;
    categoryId: number;
    isFeatured: boolean;
    isActive: boolean;
    existingImages: string[];
    newImages?: File[];
    variantType?: string;
    discountPercentage?: number;
    discountStartDate?: string;
    discountEndDate?: string;
    metaTitle?: string;
    metaDescription?: string;
    attributes?: UpdateProductAttributeRequest[];
}

export interface UpdateProductAttributeRequest {
    id?: number;
    attributeId: number;
    value: string;
}

export interface ProductsAnalytics {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    featuredProducts: number;
    productsByCategory: CategoryProductCount[];
    topSellingProducts: TopProduct[];
    mostViewedProducts: TopProduct[];
    topRatedProducts: TopProduct[];
}

export interface CategoryProductCount {
    categoryName: string;
    productCount: number;
}

export interface TopProduct {
    id: number;
    name: string;
    imageUrl?: string;
    value: number;
}
export interface AddProductVariantRequest {
    productId: number;
    name: string;
    sku: string;
    price: number;
    salePrice: number | null;
    stockQuantity: number | null;
    image?: File;
}
