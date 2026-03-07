import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../api/models/api-response.model';
import { PagedResponse } from '../api/models/pagination.models';
import {
    Courier,
    StoreCourierSetting,
    Shipment,
    ShipmentDetails,
    ConfigureCourierRequest,
    CreateShipmentRequest,
    ShipmentCreatedDto,
    ShipmentStatus,
    TrackingResult
} from '../api/models/shipping.models';

@Injectable({
    providedIn: 'root'
})
export class ShippingDashboardService {
    private apiUrl = `${environment.apiUrl}/shipping-dashboard`;
    private http = inject(HttpClient);

    createShipment(req: CreateShipmentRequest): Observable<ApiResponse<ShipmentCreatedDto>> {
        return this.http.post<ApiResponse<ShipmentCreatedDto>>(`${this.apiUrl}/create`, req);
    }

    cancelShipment(shipmentId: number): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/cancel/${shipmentId}`, {});
    }

    getShipments(page: number = 1, pageSize: number = 10, status?: ShipmentStatus): Observable<PagedResponse<Shipment>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        if (status) {
            params = params.set('status', status);
        }

        return this.http.get<PagedResponse<Shipment>>(`${this.apiUrl}/list`, { params });
    }

    getShipmentDetails(shipmentId: number): Observable<ApiResponse<ShipmentDetails>> {
        return this.http.get<ApiResponse<ShipmentDetails>>(`${this.apiUrl}/${shipmentId}`);
    }

    updateShipmentStatus(shipmentId: number, newStatus: ShipmentStatus, description?: string): Observable<ApiResponse<void>> {
        return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${shipmentId}/status`, { newStatus, description });
    }
}

@Injectable({
    providedIn: 'root'
})
export class ShippingPublicService {
    private apiUrl = `${environment.apiUrl}/shipping`;
    private http = inject(HttpClient);

    trackOrder(orderId: number): Observable<ApiResponse<TrackingResult>> {
        return this.http.get<ApiResponse<TrackingResult>>(`${this.apiUrl}/track/${orderId}`);
    }
}
