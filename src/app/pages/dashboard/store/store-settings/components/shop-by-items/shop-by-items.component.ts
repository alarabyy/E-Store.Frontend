import { Component, inject, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShopByItemsService } from './shop-by-items.service';
import { ToastService } from '../../../../../../components/toast/services/toast.service';
import { ShopByItem } from './shop-by-items.model';
import { ApiResponse } from '../../../../../../core/api/models/api-response.model';
import { Observable } from 'rxjs';
import { UrlPipe } from '../../../../../../components/pipes/url.pipe';

@Component({
    selector: 'app-shop-by-items',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UrlPipe],
    templateUrl: './shop-by-items.component.html',
    styleUrl: './shop-by-items.component.scss'
})
export class ShopByItemsComponent {
    @Input() items: ShopByItem[] = [];
    @Output() refresh = new EventEmitter<void>();

    isSaving = false;
    showModal = false;
    modalMode: 'add' | 'edit' = 'add';
    currentItemId: number | null = null;
    modalForm: FormGroup;
    selectedFile: File | null = null;
    imagePreview: string | null = null;

    private shopByItemsService = inject(ShopByItemsService);
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);

    constructor() {
        this.modalForm = this.fb.group({
            title: ['', [Validators.required]],
            linkUrl: [''],
            displayOrder: [0, [Validators.required]],
            isActive: [true]
        });
    }

    openModal(mode: 'add' | 'edit', item?: ShopByItem): void {
        this.modalMode = mode;
        this.showModal = true;
        this.selectedFile = null;
        this.imagePreview = item?.imageUrl || null;
        this.currentItemId = item?.id || null;

        if (mode === 'edit' && item) {
            this.modalForm.patchValue({
                title: item.title,
                linkUrl: item.linkUrl || '',
                displayOrder: item.displayOrder,
                isActive: item.isActive
            });
        } else {
            this.modalForm.reset({
                title: '',
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

    saveItem(): void {
        if (this.modalForm.invalid) {
            this.modalForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const formData = new FormData();
        const formValue = this.modalForm.value;

        formData.append('Title', formValue.title);
        if (formValue.linkUrl) formData.append('LinkUrl', formValue.linkUrl);
        formData.append('DisplayOrder', formValue.displayOrder.toString());
        formData.append('IsActive', formValue.isActive.toString());

        if (this.selectedFile) {
            formData.append('ImageUrl', this.selectedFile);
        }

        const obs: Observable<ApiResponse<any>> = this.modalMode === 'add'
            ? (this.shopByItemsService as ShopByItemsService).createItem(formData)
            : (this.shopByItemsService as ShopByItemsService).updateItem(this.currentItemId!, formData);

        obs.subscribe({
            next: (res: ApiResponse<any>) => {
                if (res.isSuccess) {
                    this.toastService.success(`Item saved successfully`);
                    this.refresh.emit();
                    this.closeModal();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to save item');
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

    deleteItem(id: number): void {
        if (!confirm(`Are you sure you want to delete this item?`)) return;

        (this.shopByItemsService as ShopByItemsService).deleteItem(id).subscribe({
            next: (res: ApiResponse<any>) => {
                if (res.isSuccess) {
                    this.toastService.success(`Item deleted successfully`);
                    this.refresh.emit();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to delete item');
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
