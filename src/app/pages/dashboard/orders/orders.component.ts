import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from './order.service';
import { OrderDetail, OrderStatus, GetOrdersRequest } from './order.models';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
    private orderService = inject(OrderService);
    protected Math = Math;

    orders = signal<OrderDetail[]>([]);
    totalRecords = signal(0);
    loading = signal(false);

    // Filters
    currentPage = 1;
    pageSize = 10;
    searchText = '';
    statusFilter?: OrderStatus;

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
        this.loadOrders();
    }

    loadOrders(): void {
        this.loading.set(true);
        const request: GetOrdersRequest = {
            page: this.currentPage,
            pageSize: this.pageSize,
            search: this.searchText || undefined,
            status: this.statusFilter
        };

        this.orderService.getOrders(request)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (resp) => {
                    this.orders.set(resp.data);
                    this.totalRecords.set(resp.totalRecords);
                },
                error: (err) => console.error('Failed to load orders', err)
            });
    }

    onFilterChange(): void {
        this.currentPage = 1;
        this.loadOrders();
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadOrders();
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.loadOrders();
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

    updateStatus(orderId: number, newStatus: OrderStatus): void {
        this.orderService.updateStatus(orderId, { status: newStatus }).subscribe({
            next: () => {
                this.orders.update(orders =>
                    orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
                );
            }
        });
    }

    get totalPages(): number {
        return Math.ceil(this.totalRecords() / this.pageSize);
    }

    get pages(): number[] {
        const total = this.totalPages;
        const current = this.currentPage;
        const pages: number[] = [];
        const maxVisible = 5;

        let start = Math.max(1, current - Math.floor(maxVisible / 2));
        let end = Math.min(total, start + maxVisible - 1);
        start = Math.max(1, end - maxVisible + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }
}
