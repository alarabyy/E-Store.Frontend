export interface NewsletterSubscriptionDto {
    id: number;
    email: string;
    subscribedAt: string;
    isActive: boolean;
}

export interface PagedResponse<T> {
    data: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    isSuccess: boolean;
}

export interface NewsletterDashboardDataDto {
    subscriptions: PagedResponse<NewsletterSubscriptionDto>;
    totalActiveSubscriptions: number;
    newSubscriptionsThisWeek: number;
    totalUnsubscribed: number;
}
