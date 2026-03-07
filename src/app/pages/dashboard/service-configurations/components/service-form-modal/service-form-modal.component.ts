import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceConfigurationDto, ServiceType } from '../../models/service-configuration.model';
import { environment } from '../../../../../../environments/environment';

@Component({
    selector: 'app-service-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './service-form-modal.component.html',
    styleUrls: ['./service-form-modal.component.scss']
})
export class ServiceFormModalComponent implements OnInit {
    private fb = inject(FormBuilder);
    private backendUrl = environment.backendUrl;

    @Input() serviceData: ServiceConfigurationDto | null = null;
    @Input() initialType: ServiceType = ServiceType.Payment;
    @Output() save = new EventEmitter<any>();
    @Output() close = new EventEmitter<void>();

    serviceForm!: FormGroup;
    ServiceType = ServiceType;

    serviceTypes = [
        { value: ServiceType.Payment, label: 'Payment Gateway', icon: 'ri-bank-card-line' },
        { value: ServiceType.Shipping, label: 'Shipping Courier', icon: 'ri-truck-line' },
        { value: ServiceType.SMS, label: 'SMS Provider', icon: 'ri-chat-3-line' },
        { value: ServiceType.Analytics, label: 'Analytics System', icon: 'ri-bar-chart-2-line' }
    ];

    logoPreview: string | null = null;
    selectedFile: File | null = null;

    ngOnInit(): void {
        this.initForm();
        if (this.serviceData) {
            this.patchForm();
            if (this.serviceData.logoUrl) {
                this.logoPreview = this.serviceData.logoUrl.startsWith('http')
                    ? this.serviceData.logoUrl
                    : `${this.backendUrl}/${this.serviceData.logoUrl}`;
            }
        }
    }

    private initForm(): void {
        this.serviceForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            logoUrl: [''],
            type: [this.initialType, [Validators.required]],
            priority: [1, [Validators.required, Validators.min(1)]],
            weight: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
            supportedCurrencies: ['USD, EGP', Validators.required],
            supportedCountries: ['EG, US', Validators.required],
            configurationKeys: ['', Validators.required]
        });
    }

    private patchForm(): void {
        if (!this.serviceData) return;
        this.serviceForm.patchValue({
            name: this.serviceData.name,
            logoUrl: this.serviceData.logoUrl || '',
            type: this.serviceData.type,
            priority: this.serviceData.priority,
            weight: this.serviceData.weight,
            supportedCurrencies: this.serviceData.supportedCurrencies?.join(', ') || '',
            supportedCountries: this.serviceData.supportedCountries?.join(', ') || '',
            configurationKeys: this.serviceData.configurationKeys?.join(', ') || ''
        });
    }

    onFileChange(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = () => {
                this.logoPreview = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    removeLogo(): void {
        this.selectedFile = null;
        this.logoPreview = null;
        this.serviceForm.patchValue({ logoUrl: '' });
    }

    onSave(): void {
        if (this.serviceForm.invalid) {
            this.serviceForm.markAllAsTouched();
            return;
        }

        const val = this.serviceForm.value;
        const payload = {
            ...val,
            logo: this.selectedFile,
            supportedCurrencies: val.supportedCurrencies.split(',').map((s: string) => s.trim()).filter(Boolean),
            supportedCountries: val.supportedCountries.split(',').map((s: string) => s.trim()).filter(Boolean),
            configurationKeys: val.configurationKeys.split(',').map((s: string) => s.trim()).filter(Boolean)
        };

        this.save.emit(payload);
    }

    onClose(): void {
        this.close.emit();
    }

    selectType(type: ServiceType): void {
        this.serviceForm.get('type')?.setValue(type);
    }
}
