import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { PaymentDashboardService } from './services/payment-dashboard.service';
import { PaymentGatewayDto, GatewayEnvironment, PaymentGatewayType } from './models/payment-gateway.model';
import { ToastService } from '../../../components/toast/services/toast.service';

@Component({
    selector: 'app-payment-dashboard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './payments.component.html',
    styleUrls: ['./payments.component.scss']
})
export class PaymentDashboardComponent implements OnInit {
    private service = inject(PaymentDashboardService);
    private cdr = inject(ChangeDetectorRef);
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);

    gateways: PaymentGatewayDto[] = [];
    totalGateways = 0;
    activeGateways = 0;
    isLoading = true;
    GatewayEnvironment = GatewayEnvironment;
    PaymentGatewayType = PaymentGatewayType;

    // Convert enum to array for select options
    gatewayTypes = [
        { id: PaymentGatewayType.Stripe, name: 'Stripe' },
        { id: PaymentGatewayType.PayPal, name: 'PayPal' },
        { id: PaymentGatewayType.Adyen, name: 'Adyen' },
        { id: PaymentGatewayType.Paymob, name: 'Paymob' },
        { id: PaymentGatewayType.FawryPay, name: 'FawryPay' }
    ];

    isGatewayModalOpen = false;
    isCredentialsModalOpen = false;
    editingGatewayId: number | null = null;
    credentialsGatewayId: number | null = null;
    credentialsGatewayName: string = '';

    gatewayForm!: FormGroup;
    credentialsForm!: FormGroup;

    ngOnInit(): void {
        this.initForms();
        this.loadGateways();
    }

    initForms(): void {
        this.gatewayForm = this.fb.group({
            name: [PaymentGatewayType.Stripe, [Validators.required]],
            priority: [1, [Validators.required, Validators.min(1)]],
            weight: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
            environment: [GatewayEnvironment.Sandbox, Validators.required],
            supportedCurrencies: ['USD, EUR, EGP', Validators.required],
            supportedCountries: ['US, EG, GB', Validators.required]
        });

        this.credentialsForm = this.fb.group({
            credentialsList: this.fb.array([
                this.createCredentialField('PublicKey', ''),
                this.createCredentialField('SecretKey', '')
            ])
        });
    }

    get credentialControls() {
        return (this.credentialsForm.get('credentialsList') as FormArray).controls;
    }

    createCredentialField(key = '', value = '') {
        return this.fb.group({
            key: [key, Validators.required],
            value: [value, Validators.required]
        });
    }

    addCredentialField() {
        (this.credentialsForm.get('credentialsList') as FormArray).push(this.createCredentialField());
    }

    removeCredentialField(index: number) {
        (this.credentialsForm.get('credentialsList') as FormArray).removeAt(index);
    }

    onRefresh(): void {
        this.loadGateways();
    }

    loadGateways(): void {
        this.isLoading = true;
        this.service.getGateways().subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.gateways = res.data || [];
                    this.totalGateways = res.totalCount || 0;
                    this.activeGateways = this.gateways.filter(g => g.isActive).length;

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

    openCreateModal(): void {
        this.editingGatewayId = null;
        this.gatewayForm.reset({
            priority: 1,
            weight: 50,
            environment: GatewayEnvironment.Sandbox,
            supportedCurrencies: 'USD, EUR, EGP',
            supportedCountries: 'US, EG, GB'
        });
        this.isGatewayModalOpen = true;
    }

    openEditModal(gateway: PaymentGatewayDto): void {
        this.editingGatewayId = gateway.id;

        // Ensure name is matched against the enum numeric value if it comes back as string from api
        let nameVal = gateway.name;
        if (typeof gateway.name === 'string') {
            const mapped = Object.keys(PaymentGatewayType).find(k => k.toLowerCase() === gateway.name.toString().toLowerCase());
            if (mapped) nameVal = (PaymentGatewayType as any)[mapped];
        }

        this.gatewayForm.patchValue({
            name: nameVal,
            priority: gateway.priority,
            weight: gateway.weight,
            environment: gateway.environment,
            supportedCurrencies: gateway.supportedCurrencies.join(', '),
            supportedCountries: gateway.supportedCountries.join(', ')
        });
        this.isGatewayModalOpen = true;
    }

    closeGatewayModal(): void {
        this.isGatewayModalOpen = false;
    }

    openCredentialsModal(gateway: PaymentGatewayDto): void {
        this.credentialsGatewayId = gateway.id;
        this.credentialsGatewayName = this.getGatewayName(gateway.name);
        this.credentialsForm.reset();

        const credArray = this.credentialsForm.get('credentialsList') as FormArray;
        credArray.clear();
        credArray.push(this.createCredentialField('PublicKey', ''));
        credArray.push(this.createCredentialField('SecretKey', ''));

        this.isCredentialsModalOpen = true;
    }

    closeCredentialsModal(): void {
        this.isCredentialsModalOpen = false;
    }

    saveGateway(): void {
        if (this.gatewayForm.invalid) {
            this.toastService.error('Please fill all required fields correctly');
            return;
        }

        const formVal = this.gatewayForm.value;
        const payload = {
            name: Number(formVal.name),
            priority: formVal.priority,
            weight: formVal.weight,
            environment: Number(formVal.environment),
            supportedCurrencies: formVal.supportedCurrencies.split(',').map((s: string) => s.trim()).filter(Boolean),
            supportedCountries: formVal.supportedCountries.split(',').map((s: string) => s.trim()).filter(Boolean)
        };

        if (this.editingGatewayId) {
            this.service.updateGateway(this.editingGatewayId, payload).subscribe({
                next: (res) => {
                    if (res.isSuccess) {
                        this.toastService.success(`Gateway updated successfully!`);
                        this.closeGatewayModal();
                        this.loadGateways();
                    } else {
                        this.toastService.error(res.error?.message || 'Failed to update gateway');
                    }
                },
                error: () => this.toastService.error('Connection error during update')
            });
        } else {
            this.service.createGateway(payload).subscribe({
                next: (res) => {
                    if (res.isSuccess) {
                        this.toastService.success(`Gateway created successfully!`);
                        this.closeGatewayModal();
                        this.loadGateways();
                    } else {
                        this.toastService.error(res.error?.message || 'Failed to create gateway');
                    }
                },
                error: () => this.toastService.error('Connection error during creation')
            });
        }
    }

    saveCredentials(): void {
        if (this.credentialsForm.invalid || !this.credentialsGatewayId) {
            this.toastService.error('Please provide valid credentials');
            return;
        }

        const credsList = this.credentialsForm.value.credentialsList;
        const credentialsObj: Record<string, string> = {};
        credsList.forEach((item: any) => {
            if (item.key && item.value) {
                credentialsObj[item.key] = item.value;
            }
        });

        this.service.setCredentials(this.credentialsGatewayId, credentialsObj).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success('Credentials updated successfully!');
                    this.closeCredentialsModal();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to set credentials');
                }
            },
            error: () => this.toastService.error('Connection error saving credentials')
        });
    }

    toggleGateway(gateway: PaymentGatewayDto): void {
        const action = gateway.isActive ? this.service.disableGateway(gateway.id) : this.service.enableGateway(gateway.id);
        const actionName = gateway.isActive ? 'Disable' : 'Enable';
        const gatewayName = this.getGatewayName(gateway.name);

        this.toastService.show(`Processing ${actionName} for ${gatewayName}...`, 'info');

        action.subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.toastService.success(`Gateway ${gatewayName} ${actionName}d successfully`);
                    this.loadGateways();
                } else {
                    this.toastService.error(res.error?.message || `Failed to ${actionName} ${gatewayName}`);
                }
            },
            error: () => this.toastService.error('Communication error with gateway')
        });
    }

    getEnvBadgeClass(env: GatewayEnvironment): string {
        return env === GatewayEnvironment.Production ? 'badge-success' : 'badge-warning';
    }

    getGatewayName(nameValue: string | number): string {
        if (typeof nameValue === 'string') return nameValue;

        const found = this.gatewayTypes.find(g => g.id === nameValue);
        return found ? found.name : `Unknown (${nameValue})`;
    }
}
