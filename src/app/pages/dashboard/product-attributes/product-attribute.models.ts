export interface ProductAttribute {
    id: number;
    name: string;
    categoryIds: number[];
    categoryNames?: string[];
}

export interface CreateProductAttributeRequest {
    name: string;
    categoryIds: number[];
}

export interface UpdateProductAttributeRequest {
    id: number;
    name: string;
    categoryIds: number[];
}
