import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CategoryService } from '../category.service';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../category.models';
import { ToastService } from '../../../../core/services/toast.service';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-category-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './category-form.component.html',
    styleUrl: './category-form.component.scss'
})
export class CategoryFormComponent implements OnInit {
    isEditing = false;
    categoryId: number | null = null;
    isLoading = false;
    categoryForm: FormGroup;
    parentCategories: Category[] = [];
    selectedFile: File | null = null;
    imagePreview: string | null = null;
    backendUrl = environment.backendUrl;

    categoryService = inject(CategoryService);
    toastService = inject(ToastService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    fb = inject(FormBuilder);
    cdr = inject(ChangeDetectorRef);

    constructor() {
        this.categoryForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            slug: ['', [Validators.required]],
            description: [''],
            imageUrl: [''],
            parentCategoryId: [null],
            displayOrder: [0],
            metaTitle: [''],
            metaDescription: [''],
            isActive: [true]
        });
    }

    ngOnInit() {
        this.loadParentCategories();

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditing = true;
                this.categoryId = +params['id'];
                this.loadCategory(this.categoryId);
            }
        });

        // Auto-generate slug from name (only when creating)
        this.categoryForm.get('name')?.valueChanges.subscribe(val => {
            if (!this.isEditing) {
                this.categoryForm.get('slug')?.setValue(this.buildSlug(val), { emitEvent: false });
            }
        });
    }

    /** توليد slug يدعم العربي والإنجليزي بشكل متماثل */
    buildSlug(name: string): string {
        if (!name) return '';
        return name
            .trim()
            .toLowerCase()
            .replace(/[\s_]+/g, '-')           // استبدال المسافات والشرطات السفلية بداش
            .replace(/-+/g, '-')               // منع تكرار الداش
            .replace(/^-+|-+$/g, '');          // إزالة الداش من البداية والنهاية
    }

    loadParentCategories() {
        this.categoryService.getAllActive().subscribe({
            next: (res) => {
                // Exclude current category from parents if editing
                this.parentCategories = res.data?.filter(c => c.id !== this.categoryId) || [];
                this.cdr.detectChanges();
            }
        });
    }

    loadCategory(id: number) {
        this.isLoading = true;
        this.categoryService.getCategoryById(id).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.categoryForm.patchValue(res.data);
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }
            },
            error: () => {
                this.toastService.error('Failed to load category');
                this.isLoading = false;
            }
        });
    }

    generateSlug() {
        // kept for template compatibility — logic moved to valueChanges
    }

    onFileSelected(event: any) {
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

    getImageUrl(path: string | null): string {
        if (!path) return 'assets/images/placeholder-cat.png';
        if (path.startsWith('http')) return path;
        return `${this.backendUrl}/${path}`;
    }

    isInvalid(controlName: string): boolean {
        const control = this.categoryForm.get(controlName);
        return !!(control && control.invalid && control.touched);
    }

    onSubmit() {
        if (this.categoryForm.invalid) {
            this.categoryForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        const formData = this.categoryForm.value;

        if (this.isEditing && this.categoryId) {
            const updateRequest: UpdateCategoryRequest = {
                ...formData,
                id: this.categoryId,
                isActive: this.categoryForm.get('isActive')?.value ?? true,
                imageUrl: this.categoryForm.get('imageUrl')?.value,
                image: this.selectedFile
            };
            this.categoryService.updateCategory(updateRequest).subscribe({
                next: (res) => {
                    if (res.isSuccess) {
                        this.toastService.success('Category updated successfully');
                        this.router.navigate(['/dashboard/categories']);
                    } else {
                        this.isLoading = false;
                        this.toastService.error(res.error?.message || 'Failed to update category');
                    }
                },
                error: (err) => {
                    this.isLoading = false;
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to update category';
                    this.toastService.error(msg);
                }
            });
        } else {
            const createRequest: CreateCategoryRequest = {
                ...formData,
                image: this.selectedFile
            };
            this.categoryService.createCategory(createRequest).subscribe({
                next: (res) => {
                    if (res.isSuccess) {
                        this.toastService.success('Category created successfully');
                        this.router.navigate(['/dashboard/categories']);
                    } else {
                        this.isLoading = false;
                        this.toastService.error(res.error?.message || 'Failed to create category');
                    }
                },
                error: (err) => {
                    this.isLoading = false;
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to create category';
                    this.toastService.error(msg);
                }
            });
        }
    }
}
