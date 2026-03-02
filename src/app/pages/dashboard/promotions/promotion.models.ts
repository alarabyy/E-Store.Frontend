import { PromotionType, AppliesToType } from './promotion.enums';

export interface Promotion {
    id: number;
    code: string;
    type: PromotionType;
    value: number;
    maxDiscountAmount?: number;
    minimumOrderAmount?: number;
    usageLimit?: number;
    usagePerUser?: number;
    startsAt: Date;
    endsAt: Date;
    appliesToType: AppliesToType;
    isActive: boolean;
    metadata?: string;
    createdAt: Date;
}

export interface CreatePromotionRequest {
    code: string;
    type: PromotionType;
    value: number;
    maxDiscountAmount?: number;
    minimumOrderAmount?: number;
    usageLimit?: number;
    usagePerUser?: number;
    startsAt: string;
    endsAt: string;
    isActive: boolean;
    appliesToType: AppliesToType;
    metadata?: string;
}

export interface UpdatePromotionRequest extends CreatePromotionRequest {
    id: number;
}

export interface ApplyPromotionRequest {
    promoCode: string;
    productId?: number;
    amount?: number;
}

export interface DiscountResult {
    isValid: boolean;
    errorMessage?: string;
    discountAmount: number;
    finalAmount: number;
    isFreeShipping: boolean;
}
