import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShippingPublicService } from '../../../../core/services/shipping.service';
import { TrackingResult, ShipmentStatus } from '../../../../core/api/models/shipping.models';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../components/toast/services/toast.service';
import { LoaderComponent } from '../../../../components/loader/loader.component';

@Component({
    selector: 'app-track-order',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './track-order.component.html',
    styleUrls: ['./track-order.component.scss']
})
export class TrackOrderComponent implements OnInit {
    private service = inject(ShippingPublicService);
    private route = inject(ActivatedRoute);
    private cdr = inject(ChangeDetectorRef);
    private toastService = inject(ToastService);

    orderNumber: string = '';
    trackingResult: TrackingResult | null = null;
    isLoading = false;
    error: string | null = null;

    ShipmentStatus = ShipmentStatus;

    ngOnInit(): void {
        const id = this.route.snapshot.queryParamMap.get('id') || this.route.snapshot.paramMap.get('id');
        if (id) {
            this.orderNumber = id;
            this.track();
        }
    }

    track(): void {
        if (!this.orderNumber) return;

        this.isLoading = true;
        this.error = null;
        this.trackingResult = null;

        this.service.trackOrder(+this.orderNumber).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.trackingResult = res.data;
                } else {
                    this.error = res.error?.message || 'Shipment not found for this order.';
                }
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.error = 'Unable to fetch tracking info. Please check your order number.';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    getStepStatus(status: ShipmentStatus): 'completed' | 'current' | 'pending' {
        if (!this.trackingResult) return 'pending';

        const statusOrder = [
            ShipmentStatus.Created,
            ShipmentStatus.PickedUp,
            ShipmentStatus.InTransit,
            ShipmentStatus.OutForDelivery,
            ShipmentStatus.Delivered
        ];

        const currentIdx = statusOrder.indexOf(this.trackingResult.status);
        const targetIdx = statusOrder.indexOf(status);

        if (currentIdx > targetIdx) return 'completed';
        if (currentIdx === targetIdx) return 'current';
        return 'pending';
    }
}
