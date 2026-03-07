import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ServiceConfigurationService } from './services/service-configuration.service';
import { ServiceConfigurationDto, ServiceType } from './models/service-configuration.model';
import { ToastService } from '../../../components/toast/services/toast.service';
import { ServiceFormModalComponent } from './components/service-form-modal/service-form-modal.component';
import { ServiceSetupModalComponent } from './components/service-setup-modal/service-setup-modal.component';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-service-configurations',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ServiceFormModalComponent, ServiceSetupModalComponent],
    templateUrl: './service-configurations.component.html',
    styleUrls: ['./service-configurations.component.scss']
})
export class ServiceConfigurationsComponent implements OnInit {
    private service = inject(ServiceConfigurationService);
    private cdr = inject(ChangeDetectorRef);
    private toastService = inject(ToastService);
    private backendUrl = environment.backendUrl;

    services: ServiceConfigurationDto[] = [];
    filteredServices: ServiceConfigurationDto[] = [];
    isLoading = true;

    ServiceType = ServiceType;
    activeTab: ServiceType | 'all' = 'all';

    stats = {
        total: 0,
        active: 0,
        configured: 0,
        unconfigured: 0
    };

    tabs: { id: ServiceType | 'all', label: string, icon: string }[] = [
        { id: 'all', label: 'Global Overview', icon: 'ri-global-line' },
        { id: ServiceType.Payment, label: 'Payment Gateways', icon: 'ri-bank-card-line' },
        { id: ServiceType.Shipping, label: 'Shipping Couriers', icon: 'ri-truck-line' },
        { id: ServiceType.SMS, label: 'SMS Providers', icon: 'ri-chat-3-line' },
        { id: ServiceType.Analytics, label: 'Analytics Systems', icon: 'ri-bar-chart-2-line' }
    ];

    brandMetadata: Record<string, { icon: string, color: string }> = {
        'stripe': { icon: 'ri-stripe-fill', color: '#635bff' },
        'paypal': { icon: 'ri-paypal-fill', color: '#003087' },
        'paymob': { icon: 'ri-bank-line', color: '#ff4d4d' },
        'fawry': { icon: 'ri-money-dollar-circle-line', color: '#fdb913' },
        'fedex': { icon: 'ri-truck-fill', color: '#4d148c' },
        'dhl': { icon: 'ri-truck-fill', color: '#d40511' },
        'aramex': { icon: 'ri-truck-fill', color: '#e31e24' },
        'twilio': { icon: 'ri-chat-poll-line', color: '#f22f46' },
        'firebase': { icon: 'ri-fire-line', color: '#ffca28' },
        'google analytics': { icon: 'ri-google-line', color: '#f4b400' }
    };

    isServiceModalOpen = false;
    isConfigModalOpen = false;
    selectedService: ServiceConfigurationDto | null = null;
    configuringService: ServiceConfigurationDto | null = null;

    ngOnInit(): void {
        this.loadServices();
    }

    loadServices(): void {
        this.isLoading = true;
        this.service.getServices().subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.services = res.data || [];
                    this.calculateStats();
                    this.filterServices();
                }
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.isLoading = false;
                this.toastService.error('Failed to load services');
                this.cdr.detectChanges();
            }
        });
    }

    calculateStats(): void {
        this.stats = {
            total: this.services.length,
            active: this.services.filter(s => s.isActive).length,
            configured: this.services.filter(s => s.isConfigured).length,
            unconfigured: this.services.filter(s => !s.isConfigured).length
        };
    }

    setActiveTab(tabId: ServiceType | 'all'): void {
        this.activeTab = tabId;
        this.filterServices();
    }

    filterServices(): void {
        if (this.activeTab === 'all') {
            this.filteredServices = this.services;
        } else {
            this.filteredServices = this.services.filter(s => s.type === this.activeTab);
        }
    }

    getFullLogoUrl(path: string | undefined): string | null {
        if (!path) return null;
        return path.startsWith('http') ? path : `${this.backendUrl}/${path}`;
    }

    getBrandIcon(name: string, type: ServiceType): string {
        const lowerName = name.toLowerCase();
        const found = Object.keys(this.brandMetadata).find(k => lowerName.includes(k));
        if (found) return this.brandMetadata[found].icon;

        switch (type) {
            case ServiceType.Payment: return 'ri-bank-card-line';
            case ServiceType.Shipping: return 'ri-truck-line';
            case ServiceType.SMS: return 'ri-chat-3-line';
            case ServiceType.Analytics: return 'ri-bar-chart-2-line';
            default: return 'ri-extension-line';
        }
    }

    getBrandColor(name: string): string {
        const lowerName = name.toLowerCase();
        const found = Object.keys(this.brandMetadata).find(k => lowerName.includes(k));
        return found ? this.brandMetadata[found].color : '#0f172a';
    }

    getServiceTypeName(type: ServiceType): string {
        return ServiceType[type];
    }

    openCreateModal(): void {
        this.selectedService = null;
        this.isServiceModalOpen = true;
    }

    openEditModal(service: ServiceConfigurationDto): void {
        this.selectedService = service;
        this.isServiceModalOpen = true;
    }

    openConfigModal(service: ServiceConfigurationDto): void {
        this.configuringService = service;
        this.isConfigModalOpen = true;
    }

    onSaveService(payload: any): void {
        const action = this.selectedService
            ? this.service.updateService({ ...payload, id: this.selectedService.id })
            : this.service.createService(payload);

        action.subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success(`Service ${this.selectedService ? 'updated' : 'created'} successfully`);
                    this.isServiceModalOpen = false;
                    this.loadServices();
                } else {
                    this.toastService.error(res.error?.message || 'Action failed');
                }
            }
        });
    }

    onSaveConfig(values: Record<string, string>): void {
        if (!this.configuringService) return;

        this.service.configureService(this.configuringService.id, values).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success('Configuration saved');
                    this.isConfigModalOpen = false;
                    this.loadServices();
                }
            }
        });
    }

    toggleService(service: ServiceConfigurationDto): void {
        this.service.toggleService(service.id, !service.isActive).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success(`Service ${service.name} ${!service.isActive ? 'enabled' : 'disabled'}`);
                    this.loadServices();
                }
            }
        });
    }
}
