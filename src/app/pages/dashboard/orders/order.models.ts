export enum OrderStatus {
    Pending = 0,
    Processing = 1,
    Shipped = 2,
    Delivered = 3,
    Cancelled = 4,
    Refunded = 5,
    PaymentFailed = 6,
    Paid = 7
}

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    productImageUrl?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface Address {
    firstName: string;
    lastName: string;
    streetAddress: string;
    apartmentSuite?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phoneNumber: string;
}

export interface OrderDetail {
    id: number;
    orderNumber: string;
    status: OrderStatus;
    userId: number;
    userEmail: string;
    userFullName: string;
    subTotal: number;
    shippingCost: number;
    totalAmount: number;
    currency: string;
    shippingAddress: Address;
    billingAddress: Address;
    trackingNumber?: string;
    carrier?: string;
    customerNotes?: string;
    paymentId?: number;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}

export interface GetOrdersRequest {
    page: number;
    pageSize: number;
    status?: OrderStatus;
    search?: string;
}

export interface UpdateStatusRequest {
    status: OrderStatus;
    trackingNumber?: string;
    carrier?: string;
}
