export enum SupportCategory {
    TechnicalSupport = 1,
    BillingAndPayments = 2,
    SalesAndInquiries = 3,
    GeneralInformation = 4
}

export enum Priority {
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

export enum TicketStatus {
    Open = 1,
    InProgress = 2,
    Resolved = 3,
    Closed = 4
}

export interface SupportTicketDashboardItem {
    id: number;
    fullName: string;
    email: string;
    category: SupportCategory;
    priority: Priority;
    subject: string;
    message: string;
    status: TicketStatus;
    createdAt: string;
}

export interface CreateSupportTicketRequest {
    fullName: string;
    email: string;
    category: SupportCategory;
    priority: Priority;
    subject: string;
    message: string;
}
