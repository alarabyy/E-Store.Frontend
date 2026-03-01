import { Component, inject, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExclusiveOffersService } from './exclusive-offers.service';
import { ToastService } from '../../../../../../core/services/toast.service';
import { ExclusiveOffer } from './exclusive-offers.model';
import { ApiResponse } from '../../../../../../core/models/api-response.model';

import { UrlPipe } from '../../../../../../components/pipes/url.pipe';

@Component({
    selector: 'app-exclusive-offers',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UrlPipe],
    templateUrl: './exclusive-offers.component.html',
    styleUrl: './exclusive-offers.component.scss'
})
export class ExclusiveOffersComponent {
    @Input() offers: ExclusiveOffer[] = [];
    @Output() refresh = new EventEmitter<void>();

    isSaving = false;
    showModal = false;
    modalMode: 'add' | 'edit' = 'add';
    currentItemId: number | null = null;
    modalForm: FormGroup;
    selectedFile: File | null = null;
    imagePreview: string | null = null;

    private offersService = inject(ExclusiveOffersService);
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);

    constructor() {
        this.modalForm = this.fb.group({
            title: ['', [Validators.required]],
            description: [''],
            linkUrl: [''],
            displayOrder: [0, [Validators.required]],
            isActive: [true]
        });
    }

    openModal(mode: 'add' | 'edit', item?: ExclusiveOffer): void {
        this.modalMode = mode;
        this.showModal = true;
        this.selectedFile = null;
        this.imagePreview = item?.imageUrl || null;
        this.currentItemId = item?.id || null;

        if (mode === 'edit' && item) {
            this.modalForm.patchValue({
                title: item.title,
                description: item.description || '',
                linkUrl: item.linkUrl || '',
                displayOrder: item.displayOrder,
                isActive: item.isActive
            });
        } else {
            this.modalForm.reset({
                title: '',
                description: '',
                linkUrl: '',
                displayOrder: 0,
                isActive: true
            });
        }
    }

    closeModal(): void {
        this.showModal = false;
        this.currentItemId = null;
        this.selectedFile = null;
        this.imagePreview = null;
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview = reader.result as string;
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(file);
        }
    }

    saveOffer(): void {
        if (this.modalForm.invalid) {
            this.modalForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const formData = new FormData();
        const formValue = this.modalForm.value;

        formData.append('Title', formValue.title);
        if (formValue.description) formData.append('Description', formValue.description);
        if (formValue.linkUrl) formData.append('LinkUrl', formValue.linkUrl);
        formData.append('DisplayOrder', formValue.displayOrder.toString());
        formData.append('IsActive', formValue.isActive.toString());

        if (this.selectedFile) {
            formData.append('ImageUrl', this.selectedFile);
        }

        const obs = this.modalMode === 'add'
            ? this.offersService.createOffer(formData)
            : this.offersService.updateOffer(this.currentItemId!, formData);

        obs.subscribe({
            next: (res: ApiResponse<any>) => {
                if (res.isSuccess) {
                    this.toastService.success(`Offer saved successfully`);
                    this.refresh.emit();
                    this.closeModal();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to save offer');
                }
                this.isSaving = false;
            },
            error: (err: any) => {
                this.isSaving = false;
                this.toastService.error('An error occurred while saving');
                console.error(err);
            }
        });
    }

    deleteOffer(id: number): void {
        if (!confirm(`Are you sure you want to delete this offer?`)) return;

        this.offersService.deleteOffer(id).subscribe({
            next: (res: ApiResponse<any>) => {
                if (res.isSuccess) {
                    this.toastService.success(`Offer deleted successfully`);
                    this.refresh.emit();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to delete offer');
                }
            },
            error: (err: any) => {
                this.toastService.error('An error occurred while deleting');
                console.error(err);
            }
        });
    }

    isInvalid(controlName: string): boolean {
        const control = this.modalForm.get(controlName);
        return !!(control && control.invalid && control.touched);
    }
}
