import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShippingDashboardService } from '../../../core/services/shipping.service';
import {
    StoreCourierSetting,
    CourierCode,
    ConfigureCourierRequest,
    Shipment,
    ShipmentStatus
} from '../../../core/models/shipping.models';
import { ToastService } from '../../../core/services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-shipping-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './shipping.component.html',
    styleUrls: ['./shipping.component.scss']
})
export class ShippingDashboardComponent implements OnInit {
    private service = inject(ShippingDashboardService);
    private cdr = inject(ChangeDetectorRef);
    private toastService = inject(ToastService);

    courierSettings: StoreCourierSetting[] = [];
    shipments: Shipment[] = [];
    isLoading = true;
    activeShipmentsCount = 0;

    CourierCode = CourierCode;
    ShipmentStatus = ShipmentStatus;

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;
        this.loadCourierSettings();
        this.loadRecentShipments();
    }

    loadCourierSettings(): void {
        this.service.getStoreCouriers().subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.courierSettings = res.data || [];
                }
                this.cdr.detectChanges();
            },
            error: () => this.toastService.error('Failed to load courier settings')
        });
    }

    loadRecentShipments(): void {
        this.service.getShipments(1, 10).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.shipments = res.data || [];
                    this.activeShipmentsCount = res.totalCount || 0;
                }
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.isLoading = false;
                this.toastService.error('Failed to load shipments');
                this.cdr.detectChanges();
            }
        });
    }

    toggleCourier(setting: StoreCourierSetting): void {
        const action = setting.isEnabled ? this.service.disableCourier(setting.courierId) : this.service.enableCourier(setting.courierId);
        const actionName = setting.isEnabled ? 'Disabling' : 'Enabling';

        this.toastService.show(`${actionName} courier...`, 'info');

        action.subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success(`Courier ${actionName}d successfully`);
                    this.loadCourierSettings();
                } else {
                    this.toastService.error(res.error?.message || `Failed to ${actionName} courier`);
                }
            },
            error: () => this.toastService.error('Connection error')
        });
    }

    onConfigure(courierCode: CourierCode): void {
        const apiKey = window.prompt(`Enter API Key for ${courierCode}:`);
        if (apiKey === null) return;

        const apiSecret = window.prompt(`Enter API Secret for ${courierCode} (Optional):`);
        const accountNumber = window.prompt(`Enter Account Number for ${courierCode} (Optional):`);

        const req: ConfigureCourierRequest = {
            courierCode,
            apiKey: apiKey || undefined,
            apiSecret: apiSecret || undefined,
            accountNumber: accountNumber || undefined
        };

        this.service.configureCourier(req).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success(`${courierCode} configured successfully!`);
                    this.loadCourierSettings();
                } else {
                    this.toastService.error(res.error?.message || 'Configuration failed');
                }
            },
            error: () => this.toastService.error('Connection error')
        });
    }

    getStatusClass(status: ShipmentStatus): string {
        switch (status) {
            case ShipmentStatus.Delivered: return 'status-delivered';
            case ShipmentStatus.InTransit:
            case ShipmentStatus.PickedUp:
            case ShipmentStatus.OutForDelivery: return 'status-transit';
            case ShipmentStatus.Cancelled:
            case ShipmentStatus.Failed: return 'status-failed';
            default: return 'status-created';
        }
    }
}
