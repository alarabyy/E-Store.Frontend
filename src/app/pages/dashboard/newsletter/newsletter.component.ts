import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsletterDashboardService } from './services/newsletter-dashboard.service';
import { NewsletterSubscriptionDto } from './models/newsletter-subscription.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-newsletter-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './newsletter.component.html',
    styleUrls: ['./newsletter.component.scss']
})
export class NewsletterDashboardComponent implements OnInit {
    private service = inject(NewsletterDashboardService);
    private cdr = inject(ChangeDetectorRef);
    private toastService = inject(ToastService);

    subscriptions: NewsletterSubscriptionDto[] = [];
    totalSubscriptions = 0;
    totalActive = 0;
    weeklyGrowth = 0;
    totalUnsubscribed = 0;
    isLoading = true;

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;
        this.service.getSubscriptions().subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    const dashboardData = res.data;
                    this.subscriptions = dashboardData.subscriptions.data || [];
                    this.totalSubscriptions = dashboardData.subscriptions.totalCount || 0;
                    this.totalActive = dashboardData.totalActiveSubscriptions;
                    this.weeklyGrowth = dashboardData.newSubscriptionsThisWeek;
                    this.totalUnsubscribed = dashboardData.totalUnsubscribed;
                }
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    onUnsubscribe(sub: NewsletterSubscriptionDto): void {
        if (!confirm(`Are you sure you want to unsubscribe ${sub.email}?`)) return;

        this.service.unsubscribe(sub.email).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success('User unsubscribed successfully');
                    this.loadData();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to unsubscribe');
                }
            },
            error: () => this.toastService.error('Connection error')
        });
    }
}

