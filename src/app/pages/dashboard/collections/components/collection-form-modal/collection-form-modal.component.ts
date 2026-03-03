import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Collection, UpdateCollectionRequest } from '../../collection.models';
import { CollectionService } from '../../collection.service';
import { ToastService } from '../../../../../components/toast/services/toast.service';
import { UrlPipe } from '../../../../../components/pipes/url.pipe';

@Component({
    selector: 'app-collection-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UrlPipe],
    templateUrl: './collection-form-modal.component.html',
    styleUrls: ['./collection-form-modal.component.scss']
})
export class CollectionFormModalComponent implements OnInit, OnChanges {
    @Input() show = false;
    @Input() collection: Collection | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    collectionForm: FormGroup;
    isEditing = false;
    isSaving = false;
    previewUrl: string | null = null;

    constructor(
        private fb: FormBuilder,
        private collectionService: CollectionService,
        private toastService: ToastService
    ) {
        this.collectionForm = this.fb.group({
            name: ['', [Validators.required]],
            slug: ['', [Validators.required]],
            description: [''],
            imageUrl: [''],
            priceNow: [null],
            originalPrice: [null],
            isActive: [true],
            displayOrder: [0],
            metaTitle: [''],
            metaDescription: ['']
        });
    }

    ngOnInit() {
        this.collectionForm.get('name')?.valueChanges.subscribe(name => {
            if (!this.isEditing && name) {
                const slug = name.toLowerCase()
                    .replace(/[^\w ]+/g, '')
                    .replace(/ +/g, '-');
                this.collectionForm.get('slug')?.patchValue(slug, { emitEvent: false });
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['show'] && this.show) {
            if (this.collection) {
                this.isEditing = true;
                this.collectionForm.patchValue({
                    ...this.collection,
                    imageUrl: null
                });
                this.previewUrl = this.collection.imageUrl || null;
            } else {
                this.isEditing = false;
                this.collectionForm.reset({ isActive: true, displayOrder: 0 });
                this.previewUrl = null;
            }
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.collectionForm.patchValue({ imageUrl: file });
            const reader = new FileReader();
            reader.onload = () => {
                this.previewUrl = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit() {
        if (this.collectionForm.invalid) {
            this.collectionForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const formValue = this.collectionForm.value;
        const req = { ...formValue };

        if (this.isEditing && this.collection) {
            const updateReq: UpdateCollectionRequest = { ...req, id: this.collection.id };
            this.collectionService.updateCollection(this.collection.id, updateReq).subscribe({
                next: (res: any) => {
                    this.isSaving = false;
                    if (res.isSuccess || res.IsSuccess) {
                        this.toastService.success('Collection updated successfully');
                        this.saved.emit();
                        this.close.emit();
                    } else {
                        this.toastService.error(res.error?.message || 'Failed to update collection');
                    }
                },
                error: (err) => {
                    this.isSaving = false;
                    this.toastService.error(err.error?.message || 'Failed to update collection');
                }
            });
        } else {
            this.collectionService.createCollection(req).subscribe({
                next: (res: any) => {
                    this.isSaving = false;
                    if (res.isSuccess || res.IsSuccess) {
                        this.toastService.success('Collection created successfully');
                        this.saved.emit();
                        this.close.emit();
                    } else {
                        this.toastService.error(res.error?.message || 'Failed to create collection');
                    }
                },
                error: (err) => {
                    this.isSaving = false;
                    this.toastService.error(err.error?.message || 'Failed to create collection');
                }
            });
        }
    }
}
