import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OrderDetail, GetOrdersRequest, UpdateStatusRequest } from './order.models';

export interface PagedResponse<T> {
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    data: T[];
}

export interface StandardResponse<T> {
    isSuccess: boolean;
    data: T;
    error?: { code: string; message: string };
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = `${environment.apiUrl}/orders-dashboard`;

    constructor(private http: HttpClient) { }

    getOrders(request: GetOrdersRequest): Observable<PagedResponse<OrderDetail>> {
        let params = new HttpParams()
            .set('page', request.page.toString())
            .set('pageSize', request.pageSize.toString());

        if (request.status !== undefined && request.status !== null) {
            params = params.set('status', request.status.toString());
        }

        if (request.search) {
            params = params.set('search', request.search);
        }

        return this.http.get<PagedResponse<OrderDetail>>(`${this.apiUrl}/list`, { params });
    }

    getOrderById(id: number): Observable<OrderDetail> {
        return this.http.get<StandardResponse<OrderDetail>>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.data)
        );
    }

    updateStatus(orderId: number, request: UpdateStatusRequest): Observable<any> {
        return this.http.put(`${this.apiUrl}/${orderId}/status`, request);
    }
}
