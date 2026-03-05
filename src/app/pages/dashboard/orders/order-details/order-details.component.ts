import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../order.service';
import { OrderDetail, OrderStatus } from '../order.models';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-order-details',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './order-details.component.html',
    styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private orderService = inject(OrderService);

    order?: OrderDetail;
    loading = true;

    orderStatuses = [
        { value: OrderStatus.Pending, label: 'Pending', color: '#c5a059', icon: 'ri-time-line' },
        { value: OrderStatus.Processing, label: 'Processing', color: '#3b82f6', icon: 'ri-loader-4-line' },
        { value: OrderStatus.Shipped, label: 'Shipped', color: '#8b5cf6', icon: 'ri-truck-line' },
        { value: OrderStatus.Delivered, label: 'Delivered', color: '#10b981', icon: 'ri-checkbox-circle-line' },
        { value: OrderStatus.Cancelled, label: 'Cancelled', color: '#ef4444', icon: 'ri-close-circle-line' },
        { value: OrderStatus.Refunded, label: 'Refunded', color: '#64748b', icon: 'ri-refund-2-line' },
        { value: OrderStatus.PaymentFailed, label: 'Payment Failed', color: '#dc2626', icon: 'ri-bank-card-line' },
        { value: OrderStatus.Paid, label: 'Paid', color: '#059669', icon: 'ri-money-dollar-circle-line' }
    ];

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadOrder(+id);
        }
    }

    loadOrder(id: number): void {
        this.orderService.getOrderById(id)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (order) => this.order = order,
                error: (err) => console.error('Failed to load order', err)
            });
    }

    getStatusLabel(status: OrderStatus): string {
        return this.orderStatuses.find(s => s.value === status)?.label || OrderStatus[status];
    }

    getStatusColor(status: OrderStatus): string {
        return this.orderStatuses.find(s => s.value === status)?.color || '#94a3b8';
    }

    getStatusIcon(status: OrderStatus): string {
        return this.orderStatuses.find(s => s.value === status)?.icon || 'ri-checkbox-blank-circle-fill';
    }

    updateStatus(newStatus: OrderStatus): void {
        if (!this.order) return;

        this.orderService.updateStatus(this.order.id, { status: newStatus }).subscribe({
            next: () => {
                if (this.order) this.order.status = newStatus;
            }
        });
    }

    isEditingTracking = false;
    editCarrier = '';
    editTracking = '';

    toggleTrackingEdit(): void {
        if (!this.order) return;
        this.isEditingTracking = !this.isEditingTracking;
        if (this.isEditingTracking) {
            this.editCarrier = this.order.carrier || '';
            this.editTracking = this.order.trackingNumber || '';
        }
    }

    saveTracking(): void {
        if (!this.order) return;
        this.orderService.updateStatus(this.order.id, {
            status: this.order.status,
            carrier: this.editCarrier,
            trackingNumber: this.editTracking
        }).subscribe({
            next: () => {
                if (this.order) {
                    this.order.carrier = this.editCarrier;
                    this.order.trackingNumber = this.editTracking;
                }
                this.isEditingTracking = false;
            }
        });
    }
}
