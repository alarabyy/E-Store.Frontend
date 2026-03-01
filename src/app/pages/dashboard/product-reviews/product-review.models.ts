export interface ProductReview {
    id: number;
    userId: number;
    userFullName: string;
    userAvatarUrl: string;
    productId: number;
    productName: string;
    title: string;
    comment: string;
    rating: number;
    createdAt: string;
    updatedAt?: string;
}
