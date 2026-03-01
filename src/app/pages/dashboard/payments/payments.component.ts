import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentDashboardService } from './services/payment-dashboard.service';
import { PaymentGatewayDto, GatewayEnvironment } from './models/payment-gateway.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-payment-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payments.component.html',
    styleUrls: ['./payments.component.scss']
})
export class PaymentDashboardComponent implements OnInit {
    private service = inject(PaymentDashboardService);
    private cdr = inject(ChangeDetectorRef);
    private toastService = inject(ToastService);

    gateways: PaymentGatewayDto[] = [];
    totalGateways = 0;
    activeGateways = 0;
    isLoading = true;
    GatewayEnvironment = GatewayEnvironment;

    ngOnInit(): void {
        this.loadGateways();
    }

    onRefresh(): void {
        this.loadGateways();
    }

    loadGateways(): void {
        this.isLoading = true;
        this.service.getGateways().subscribe({
            next: (res) => {
                // Backend PagedResponse<T> matches ApiResponse<T[]> structure
                if (res.isSuccess) {
                    this.gateways = res.data || [];
                    this.totalGateways = res.totalCount || 0;
                    this.activeGateways = this.gateways.filter(g => g.isActive).length;

                    // User asked for "action message for everything"
                    if (this.gateways.length > 0) {
                        this.toastService.success('Gateways synchronized successfully');
                    }
                }
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.isLoading = false;
                this.toastService.error('Failed to connect to gateway systems');
                this.cdr.detectChanges();
            }
        });
    }

    onCreateGateway(): void {
        const name = window.prompt('Enter Gateway Name (e.g. Stripe, PayPal):');
        if (!name) return;

        const payload = {
            name: name,
            priority: 1,
            weight: 50,
            supportedCurrencies: ['USD', 'EUR', 'EGP'],
            supportedCountries: ['US', 'EG', 'GB'],
            environment: GatewayEnvironment.Sandbox
        };

        this.service.createGateway(payload).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success(`Gateway "${name}" created successfully!`);
                    this.loadGateways();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to create gateway');
                }
            },
            error: () => this.toastService.error('Connection error during creation')
        });
    }

    toggleGateway(gateway: PaymentGatewayDto): void {
        const action = gateway.isActive ? this.service.disableGateway(gateway.id) : this.service.enableGateway(gateway.id);
        const actionName = gateway.isActive ? 'Disable' : 'Enable';

        this.toastService.show(`Processing ${actionName} for ${gateway.name}...`, 'info');

        action.subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success(`Gateway ${gateway.name} ${actionName}d successfully`);
                    this.loadGateways();
                } else {
                    this.toastService.error(res.error?.message || `Failed to ${actionName} ${gateway.name}`);
                }
            },
            error: () => this.toastService.error('Communication error with gateway')
        });
    }

    getEnvBadgeClass(env: GatewayEnvironment): string {
        return env === GatewayEnvironment.Production ? 'badge-success' : 'badge-warning';
    }
}
