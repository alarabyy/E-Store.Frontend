import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShippingDashboardService } from '../../../core/services/shipping.service';
import {
    StoreCourierSetting,
    CourierCode,
    ConfigureCourierRequest,
    CreateShipmentRequest,
    Shipment,
    ShipmentDetails,
    ShipmentStatus
} from '../../../core/api/models/shipping.models';
import { ToastService } from '../../../components/toast/services/toast.service';
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

    // Modals
    showShipModal = false;
    showDetailsModal = false;
    isSaving = false;
    selectedShipment: ShipmentDetails | null = null;
    shipOrderForm: any = { orderId: null, courierCode: null, notes: '' };

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;
        this.loadCourierSettings();
        this.loadRecentShipments();
    }

    get activeCouriersCount(): number {
        return this.courierSettings.filter(s => s.isEnabled).length;
    }

    loadCourierSettings(): void {
        this.service.getStoreCouriers().subscribe({
            next: (res: any) => {
                if (res.isSuccess) {
                    this.courierSettings = res.data || [];
                }
                this.cdr.detectChanges();
            },
            error: (err: any) => this.toastService.error('Failed to load courier settings')
        });
    }

    loadRecentShipments(): void {
        this.service.getShipments(1, 10).subscribe({
            next: (res: any) => {
                if (res.isSuccess) {
                    this.shipments = res.data || [];
                    this.activeShipmentsCount = res.totalCount || 0;
                }
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
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
            next: (res: any) => {
                if (res.isSuccess) {
                    this.toastService.success(`Courier ${actionName}d successfully`);
                    this.loadCourierSettings();
                } else {
                    this.toastService.error(res.error?.message || `Failed to ${actionName} courier`);
                }
            },
            error: (err: any) => this.toastService.error('Connection error')
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
            next: (res: any) => {
                if (res.isSuccess) {
                    this.toastService.success(`${courierCode} configured successfully!`);
                    this.loadCourierSettings();
                } else {
                    this.toastService.error(res.error?.message || 'Configuration failed');
                }
            },
            error: (err: any) => this.toastService.error('Connection error')
        });
    }

    openShipModal(): void {
        this.showShipModal = true;
    }

    closeShipModal(): void {
        this.showShipModal = false;
        this.shipOrderForm = { orderId: null, courierCode: null, notes: '' };
    }

    onCreateShipment(): void {
        if (!this.shipOrderForm.orderId || !this.shipOrderForm.courierCode) {
            this.toastService.error('Please provide Order ID and Courier');
            return;
        }

        this.isSaving = true;
        const req: CreateShipmentRequest = {
            orderId: +this.shipOrderForm.orderId,
            courierCode: this.shipOrderForm.courierCode,
            notes: this.shipOrderForm.notes
        };

        this.service.createShipment(req).subscribe({
            next: (res: any) => {
                if (res.isSuccess) {
                    this.toastService.success(`Shipment created! Tracking: ${res.data?.trackingNumber}`);
                    this.loadRecentShipments();
                    this.closeShipModal();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to create shipment');
                }
                this.isSaving = false;
            },
            error: (err: any) => {
                this.toastService.error('Connection error');
                this.isSaving = false;
            }
        });
    }

    viewDetails(shipmentId: number): void {
        this.isLoading = true;
        this.service.getShipmentDetails(shipmentId).subscribe({
            next: (res: any) => {
                if (res.isSuccess) {
                    this.selectedShipment = res.data;
                    this.showDetailsModal = true;
                }
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                this.toastService.error('Failed to load shipment details');
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    closeDetailsModal(): void {
        this.showDetailsModal = false;
        this.selectedShipment = null;
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
