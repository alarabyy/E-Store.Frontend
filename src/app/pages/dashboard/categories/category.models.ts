
export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    parentCategoryId?: number;
    parentCategoryName?: string;
    displayOrder: number;
    isActive: boolean;
    metaTitle: string;
    metaDescription: string;
    createdAt: string;
}

export interface CreateCategoryRequest {
    name: string;
    slug: string;
    description: string;
    parentCategoryId?: number | null;
    image?: any; // File object
    displayOrder: number;
    metaTitle?: string;
    metaDescription?: string;
}

export interface UpdateCategoryRequest extends Omit<CreateCategoryRequest, 'image'> {
    id: number;
    isActive: boolean;
    imageUrl?: string;       // existing image URL (sent to backend as `imageUrl`)
    image?: any;             // new file upload
}
