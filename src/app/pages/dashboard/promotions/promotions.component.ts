import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PromotionService } from './promotion.service';
import { Promotion, CreatePromotionRequest, UpdatePromotionRequest } from './promotion.models';
import { PromotionType, AppliesToType } from './promotion.enums';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-promotions',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './promotions.component.html',
    styleUrls: ['./promotions.component.scss']
})
export class PromotionsComponent implements OnInit {
    private promotionService = inject(PromotionService);
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);

    promotions = signal<Promotion[]>([]);
    isLoading = signal(false);
    isModalOpen = signal(false);
    isEditMode = signal(false);
    selectedPromotionId = signal<number | null>(null);

    promotionForm: FormGroup;
    promotionTypes = [
        { label: 'Percentage', value: PromotionType.Percentage },
        { label: 'Fixed Amount', value: PromotionType.FixedAmount },
        { label: 'Free Shipping', value: PromotionType.FreeShipping },
        { label: 'Buy X Get Y', value: PromotionType.BuyXGetY }
    ];

    appliesToTypes = [
        { label: 'All Products', value: AppliesToType.All },
        { label: 'Specific Product', value: AppliesToType.Product },
        { label: 'Specific Category', value: AppliesToType.Category }
    ];

    constructor() {
        this.promotionForm = this.fb.group({
            code: ['', [Validators.required, Validators.minLength(3)]],
            type: [PromotionType.Percentage, Validators.required],
            value: [0, [Validators.required, Validators.min(0)]],
            maxDiscountAmount: [null],
            minimumOrderAmount: [0],
            usageLimit: [null],
            usagePerUser: [1],
            startsAt: ['', Validators.required],
            endsAt: ['', Validators.required],
            appliesToType: [AppliesToType.All, Validators.required],
            isActive: [true],
            metadata: ['']
        });
    }

    ngOnInit() {
        this.loadPromotions();
    }

    loadPromotions() {
        this.isLoading.set(true);
        this.promotionService.getPromotions().subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.promotions.set(res.data);
                }
                this.isLoading.set(false);
            },
            error: () => {
                this.toastService.error('Failed to load promotions');
                this.isLoading.set(false);
            }
        });
    }

    openCreateModal() {
        this.isEditMode.set(false);
        this.selectedPromotionId.set(null);
        const toLocalISO = (date: Date) => {
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            return localDate.toISOString().slice(0, 16);
        };

        const now = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(now.getMonth() + 1);

        this.promotionForm.reset({
            type: PromotionType.Percentage,
            appliesToType: AppliesToType.All,
            isActive: true,
            usagePerUser: 1,
            minimumOrderAmount: 0,
            startsAt: toLocalISO(now),
            endsAt: toLocalISO(oneMonthLater)
        });
        this.isModalOpen.set(true);
    }

    openEditModal(promotion: Promotion) {
        this.isEditMode.set(true);
        this.selectedPromotionId.set(promotion.id);

        // Format dates for input type="datetime-local" (using local time instead of UTC)
        const toLocalISO = (date: Date) => {
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            return localDate.toISOString().slice(0, 16);
        };

        const startsAt = toLocalISO(new Date(promotion.startsAt));
        const endsAt = toLocalISO(new Date(promotion.endsAt));

        this.promotionForm.patchValue({
            ...promotion,
            startsAt: startsAt,
            endsAt: endsAt
        });
        this.isModalOpen.set(true);
    }

    closeModal() {
        this.isModalOpen.set(false);
    }

    savePromotion() {
        if (this.promotionForm.invalid) return;

        this.isLoading.set(true);
        const formValue = this.promotionForm.value;

        // Ensure dates are converted to ISO strings for backend
        const requestBase = {
            ...formValue,
            startsAt: new Date(formValue.startsAt).toISOString(),
            endsAt: new Date(formValue.endsAt).toISOString(),
            // Ensure numeric values are indeed numbers
            value: Number(formValue.value),
            maxDiscountAmount: formValue.maxDiscountAmount ? Number(formValue.maxDiscountAmount) : null,
            minimumOrderAmount: formValue.minimumOrderAmount ? Number(formValue.minimumOrderAmount) : 0,
            usageLimit: formValue.usageLimit ? Number(formValue.usageLimit) : null,
            usagePerUser: Number(formValue.usagePerUser)
        };

        if (this.isEditMode()) {
            const updateRequest: UpdatePromotionRequest = {
                ...requestBase,
                id: this.selectedPromotionId()!
            };
            this.promotionService.updatePromotion(updateRequest).subscribe({
                next: (res) => {
                    if (res.isSuccess) {
                        this.toastService.success('Promotion updated successfully');
                        this.loadPromotions();
                        this.closeModal();
                    }
                    this.isLoading.set(false);
                },
                error: () => {
                    this.toastService.error('Failed to update promotion');
                    this.isLoading.set(false);
                }
            });
        } else {
            const createRequest: CreatePromotionRequest = requestBase;
            this.promotionService.createPromotion(createRequest).subscribe({
                next: (res) => {
                    if (res.isSuccess) {
                        this.toastService.success('Promotion created successfully');
                        this.loadPromotions();
                        this.closeModal();
                    }
                    this.isLoading.set(false);
                },
                error: (err) => {
                    this.toastService.error(err.error?.message || 'Failed to create promotion');
                    this.isLoading.set(false);
                }
            });
        }
    }

    deletePromotion(id: number) {
        if (confirm('Are you sure you want to delete this promotion?')) {
            this.promotionService.deletePromotion(id).subscribe({
                next: (res) => {
                    if (res.isSuccess) {
                        this.toastService.success('Promotion deleted successfully');
                        this.loadPromotions();
                    }
                },
                error: () => this.toastService.error('Failed to delete promotion')
            });
        }
    }

    getTypeLabel(type: PromotionType): string {
        return this.promotionTypes.find(t => t.value === type)?.label || 'Unknown';
    }

    getAppliesToLabel(type: AppliesToType): string {
        return this.appliesToTypes.find(t => t.value === type)?.label || 'Unknown';
    }
}
