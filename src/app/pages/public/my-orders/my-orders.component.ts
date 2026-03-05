import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MyOrdersService, MyOrderDto, OrderStatus } from './my-orders.service';
import { AuthService } from '../../auth/services/auth.service';
import { SeoService } from '../../../core/seo/services/seo.service';
import { environment } from '../../../../environments/environment';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-my-orders',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './my-orders.component.html',
    styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
    private ordersService = inject(MyOrdersService);
    private authService = inject(AuthService);
    private seoService = inject(SeoService);
    protected Math = Math;

    orders = signal<MyOrderDto[]>([]);
    totalRecords = signal(0);
    loading = signal(true);
    isAuthenticated = false;

    currentPage = 1;
    pageSize = 8;

    // Expanded order tracking
    expandedOrderId: number | null = null;

    statusConfig = [
        { value: OrderStatus.Pending, label: 'Pending', color: '#c5a059', icon: 'ri-time-line', description: 'Your order is being reviewed' },
        { value: OrderStatus.Paid, label: 'Paid', color: '#059669', icon: 'ri-money-dollar-circle-line', description: 'Payment confirmed' },
        { value: OrderStatus.Processing, label: 'Processing', color: '#3b82f6', icon: 'ri-loader-4-line', description: 'Order is being prepared' },
        { value: OrderStatus.Shipped, label: 'Shipped', color: '#8b5cf6', icon: 'ri-truck-line', description: 'On the way to you' },
        { value: OrderStatus.Delivered, label: 'Delivered', color: '#10b981', icon: 'ri-checkbox-circle-line', description: 'Successfully delivered' },
        { value: OrderStatus.Cancelled, label: 'Cancelled', color: '#ef4444', icon: 'ri-close-circle-line', description: 'Order was cancelled' },
        { value: OrderStatus.Refunded, label: 'Refunded', color: '#64748b', icon: 'ri-refund-2-line', description: 'Refund processed' },
        { value: OrderStatus.PaymentFailed, label: 'Payment Failed', color: '#dc2626', icon: 'ri-bank-card-line', description: 'Payment was unsuccessful' }
    ];

    ngOnInit(): void {
        this.seoService.setSeoData({
            title: 'My Orders',
            description: 'Track and manage your orders',
            keywords: 'orders, tracking, my orders'
        });

        this.isAuthenticated = this.authService.isAuthenticated();
        if (this.isAuthenticated) {
            this.loadOrders();
        } else {
            this.loading.set(false);
        }
    }

    loadOrders(): void {
        this.loading.set(true);
        this.ordersService.getMyOrders(this.currentPage, this.pageSize)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (res) => {
                    this.orders.set(res.data);
                    this.totalRecords.set(res.totalRecords);
                },
                error: (err) => console.error('Failed to load orders', err)
            });
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.loadOrders();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    toggleOrder(orderId: number): void {
        this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
    }

    getStatusLabel(status: OrderStatus): string {
        return this.statusConfig.find(s => s.value === status)?.label || 'Unknown';
    }

    getStatusColor(status: OrderStatus): string {
        return this.statusConfig.find(s => s.value === status)?.color || '#94a3b8';
    }

    getStatusIcon(status: OrderStatus): string {
        return this.statusConfig.find(s => s.value === status)?.icon || 'ri-question-line';
    }

    getStatusDescription(status: OrderStatus): string {
        return this.statusConfig.find(s => s.value === status)?.description || '';
    }

    resolveImageUrl(url: string | undefined): string {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const baseUrl = environment.backendUrl.endsWith('/') ? environment.backendUrl.slice(0, -1) : environment.backendUrl;
        const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${normalizedUrl}`;
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

    getTimeAgo(dateStr: string): string {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }
}
