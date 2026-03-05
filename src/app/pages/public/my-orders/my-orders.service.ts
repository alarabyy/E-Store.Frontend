import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

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

export interface OrderItemDto {
    id: number;
    productId: number;
    productName: string;
    productImageUrl?: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

export interface MyOrderDto {
    id: number;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    currency: string;
    createdAt: string;
    items: OrderItemDto[];
}

export interface PagedResponse<T> {
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    data: T[];
}

@Injectable({
    providedIn: 'root'
})
export class MyOrdersService {
    private apiUrl = `${environment.apiUrl}/orders`;

    constructor(private http: HttpClient) { }

    getMyOrders(page: number = 1, pageSize: number = 10): Observable<PagedResponse<MyOrderDto>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        return this.http.get<PagedResponse<MyOrderDto>>(`${this.apiUrl}/list`, { params });
    }
}
