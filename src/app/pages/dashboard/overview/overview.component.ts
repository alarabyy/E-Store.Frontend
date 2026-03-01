import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsersService } from '../users/services/users.service';
import { CategoryService } from '../categories/category.service';

interface DashboardStats {
    totalUsers: number;
    verifiedEmails: number;
    unverifiedEmails: number;
    activeUsers: number;
    lockedUsers: number;
    roles: { name: string; count: number }[];
    emailDomains: { name: string; count: number; color: string; percentage: number }[];
    emailChartGradient: string;
    totalCategories: number;
}

@Component({
    selector: 'app-overview',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
    usersService = inject(UsersService);
    cdr = inject(ChangeDetectorRef);

    stats: DashboardStats = {
        totalUsers: 0,
        verifiedEmails: 0,
        unverifiedEmails: 0,
        activeUsers: 0,
        lockedUsers: 0,
        roles: [],
        emailDomains: [],
        emailChartGradient: 'conic-gradient(#e2e8f0 0% 100%)',
        totalCategories: 0
    };

    // isLoading = true; // Removed as requested

    ngOnInit() {
        this.loadDashboardData();
        this.loadCategoryStats();
    }

    loadCategoryStats() {
        inject(CategoryService).getCategories(1, 1).subscribe({
            next: (res) => {
                this.stats.totalCategories = res.totalCount || 0;
                this.cdr.detectChanges();
            }
        });
    }

    loadDashboardData() {
        // this.isLoading = true;
        // Fetch a large number of users to calculate stats client-side 
        // since we don't have a dedicated stats endpoint
        this.usersService.getAllUsers(1, 1000).subscribe({
            next: (res) => {
                if ((res as any).isSuccess || res.totalCount !== undefined) {
                    const users = res.data || [];
                    this.calculateStats(users, res.totalCount || users.length);
                }
                // this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load dashboard data', err);
                // this.isLoading = false;
            }
        });
    }

    private calculateStats(users: any[], totalCount: number) {
        // Reset stats structure
        this.stats = {
            totalUsers: totalCount,
            verifiedEmails: 0,
            unverifiedEmails: 0,
            activeUsers: 0,
            lockedUsers: 0,
            roles: [],
            emailDomains: [],
            emailChartGradient: '',
            totalCategories: this.stats.totalCategories // Preserve current count
        };

        const roleCounts = new Map<string, number>();
        const domainCounts = new Map<string, number>();

        users.forEach(user => {
            // Email Verification
            if (user.emailConfirmed) {
                this.stats.verifiedEmails++;
            } else {
                this.stats.unverifiedEmails++;
            }

            // Lockout Status
            // Check if lockoutEnd is null OR lockoutEnd is in the past
            const isLocked = user.lockoutEnd && new Date(user.lockoutEnd) > new Date();
            if (isLocked) {
                this.stats.lockedUsers++;
            } else {
                this.stats.activeUsers++;
            }

            // Roles
            const role = user.role || 'Unknown';
            roleCounts.set(role, (roleCounts.get(role) || 0) + 1);

            // Email Domains
            if (user.email && user.email.includes('@')) {
                const domain = user.email.split('@')[1].toLowerCase();
                const provider = this.getProviderName(domain);
                domainCounts.set(provider, (domainCounts.get(provider) || 0) + 1);
            }
        });

        // Process Roles
        this.stats.roles = Array.from(roleCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        // Process Email Domains
        const totalEmails = users.length || 1;
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

        this.stats.emailDomains = Array.from(domainCounts.entries())
            .map(([name, count], index) => ({
                name,
                count,
                percentage: (count / totalEmails) * 100,
                color: colors[index % colors.length]
            }))
            .sort((a, b) => b.count - a.count);

        // Generate Conic Gradient
        let currentDeg = 0;
        const gradientParts: string[] = [];

        this.stats.emailDomains.forEach(domain => {
            const deg = (domain.count / totalEmails) * 360;
            gradientParts.push(`${domain.color} ${currentDeg}deg ${currentDeg + deg}deg`);
            currentDeg += deg;
        });

        this.stats.emailChartGradient = `conic-gradient(${gradientParts.join(', ')})`;
    }

    private getProviderName(domain: string): string {
        if (domain.includes('gmail')) return 'Gmail';
        if (domain.includes('yahoo')) return 'Yahoo';
        if (domain.includes('hotmail') || domain.includes('outlook') || domain.includes('live')) return 'Microsoft';
        return 'Other';
    }
}
