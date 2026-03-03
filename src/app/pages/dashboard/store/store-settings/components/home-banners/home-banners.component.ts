import { Component, inject, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HomeBannersService } from './home-banners.service';
import { ToastService } from '../../../../../../components/toast/services/toast.service';
import { HomePageBanner } from './home-banners.model';
import { ApiResponse } from '../../../../../../core/api/models/api-response.model';

import { UrlPipe } from '../../../../../../components/pipes/url.pipe';

@Component({
    selector: 'app-home-banners',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UrlPipe],
    templateUrl: './home-banners.component.html',
    styleUrl: './home-banners.component.scss'
})
export class HomeBannersComponent {
    @Input() banners: HomePageBanner[] = [];
    @Output() refresh = new EventEmitter<void>();

    isSaving = false;
    showModal = false;
    modalMode: 'add' | 'edit' = 'add';
    currentItemId: number | null = null;
    modalForm: FormGroup;
    selectedFile: File | null = null;
    imagePreview: string | null = null;

    private bannersService = inject(HomeBannersService);
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);

    constructor() {
        this.modalForm = this.fb.group({
            title: ['', [Validators.required]],
            subtitle: [''],
            linkUrl: [''],
            displayOrder: [0, [Validators.required]],
            isActive: [true]
        });
    }

    openModal(mode: 'add' | 'edit', item?: HomePageBanner): void {
        this.modalMode = mode;
        this.showModal = true;
        this.selectedFile = null;
        this.imagePreview = item?.imageUrl || null;
        this.currentItemId = item?.id || null;

        if (mode === 'edit' && item) {
            this.modalForm.patchValue({
                title: item.title,
                subtitle: item.subtitle || '',
                linkUrl: item.linkUrl || '',
                displayOrder: item.displayOrder,
                isActive: item.isActive
            });
        } else {
            this.modalForm.reset({
                title: '',
                subtitle: '',
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

    saveBanner(): void {
        if (this.modalForm.invalid) {
            this.modalForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const formData = new FormData();
        const formValue = this.modalForm.value;

        formData.append('Title', formValue.title);
        if (formValue.subtitle) formData.append('Subtitle', formValue.subtitle);
        if (formValue.linkUrl) formData.append('LinkUrl', formValue.linkUrl);
        formData.append('DisplayOrder', formValue.displayOrder.toString());
        formData.append('IsActive', formValue.isActive.toString());

        if (this.selectedFile) {
            formData.append('ImageUrl', this.selectedFile);
        }

        const obs = this.modalMode === 'add'
            ? this.bannersService.createBanner(formData)
            : this.bannersService.updateBanner(this.currentItemId!, formData);

        obs.subscribe({
            next: (res: ApiResponse<any>) => {
                if (res.isSuccess) {
                    this.toastService.success(`Banner saved successfully`);
                    this.refresh.emit();
                    this.closeModal();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to save banner');
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

    deleteBanner(id: number): void {
        if (!confirm(`Are you sure you want to delete this banner?`)) return;

        this.bannersService.deleteBanner(id).subscribe({
            next: (res: ApiResponse<any>) => {
                if (res.isSuccess) {
                    this.toastService.success(`Banner deleted successfully`);
                    this.refresh.emit();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to delete banner');
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
