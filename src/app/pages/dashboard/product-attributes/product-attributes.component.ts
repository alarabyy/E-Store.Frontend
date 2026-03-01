import { Component, inject, OnInit, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductAttributeService } from './product-attribute.service';
import { ProductAttribute } from './product-attribute.models';
import { CategoryService } from '../categories/category.service';
import { Category } from '../categories/category.models';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-product-attributes',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './product-attributes.component.html',
    styleUrls: ['./product-attributes.component.scss']
})
export class ProductAttributesComponent implements OnInit {
    private attrService = inject(ProductAttributeService);
    private categoryService = inject(CategoryService);
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);
    private el = inject(ElementRef);

    // Page state
    categories: Category[] = [];
    selectedCategoryId: number | null = null;
    attributes: ProductAttribute[] = [];

    // Modal state
    showModal = false;
    isEditing = false;
    currentAttrId: number | null = null;
    attrForm: FormGroup;

    // Tag-input state (multi-category picker)
    searchText = '';
    filteredCategories: Category[] = [];
    selectedCategories: Category[] = [];
    dropdownOpen = false;

    constructor() {
        this.attrForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]]
        });
    }

    ngOnInit() {
        this.loadCategories();
    }

    // ─── Close dropdown on outside click ───────────────────────────────────────
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const picker = this.el.nativeElement.querySelector('.category-picker');
        if (picker && !picker.contains(event.target as Node)) {
            this.dropdownOpen = false;
        }
    }

    // ─── Category / Attribute loading ──────────────────────────────────────────
    loadCategories() {
        this.categoryService.getAllActive().subscribe({
            next: (res) => {
                this.categories = res.data || [];
                if (this.categories.length > 0) {
                    this.selectedCategoryId = this.categories[0].id;
                    this.loadAttributes();
                }
                this.cdr.detectChanges();
            },
            error: () => this.toastService.error('Failed to load categories')
        });
    }

    loadAttributes() {
        if (!this.selectedCategoryId) return;
        this.attrService.getAttributesByCategory(this.selectedCategoryId).subscribe({
            next: (res) => {
                this.attributes = res.data || [];
                this.cdr.detectChanges();
            },
            error: () => {
                this.toastService.error('Failed to load attributes');
                this.cdr.detectChanges();
            }
        });
    }

    onCategoryChange(catId: number) {
        this.selectedCategoryId = catId;
        this.loadAttributes();
    }

    // ─── Tag-input helpers ──────────────────────────────────────────────────────
    onSearchInput() {
        const q = this.searchText.toLowerCase().trim();
        this.filteredCategories = this.categories.filter(c =>
            c.name.toLowerCase().includes(q) &&
            !this.selectedCategories.some(s => s.id === c.id)
        );
        this.dropdownOpen = true;
    }

    openDropdown() {
        this.filteredCategories = this.categories.filter(c =>
            !this.selectedCategories.some(s => s.id === c.id)
        );
        this.dropdownOpen = true;
    }

    addCategory(cat: Category) {
        if (!this.selectedCategories.some(c => c.id === cat.id)) {
            this.selectedCategories = [...this.selectedCategories, cat];
        }
        this.searchText = '';
        this.dropdownOpen = false;
        this.filteredCategories = this.categories.filter(c =>
            !this.selectedCategories.some(s => s.id === c.id)
        );
    }

    removeCategory(catId: number) {
        this.selectedCategories = this.selectedCategories.filter(c => c.id !== catId);
    }

    get hasExactMatch(): boolean {
        return this.categories.some(c =>
            c.name.toLowerCase() === this.searchText.toLowerCase().trim()
        );
    }

    // ─── Modal ──────────────────────────────────────────────────────────────────
    openCreateModal() {
        this.isEditing = false;
        this.currentAttrId = null;
        this.attrForm.reset();
        this.selectedCategories = this.selectedCategoryId
            ? this.categories.filter(c => c.id === this.selectedCategoryId)
            : [];
        this.searchText = '';
        this.dropdownOpen = false;
        this.showModal = true;
    }

    openEditModal(attr: ProductAttribute) {
        this.isEditing = true;
        this.currentAttrId = attr.id;
        this.attrForm.patchValue({ name: attr.name });
        // Pre-fill selected categories from the attribute's categoryIds
        this.selectedCategories = this.categories.filter(c =>
            (attr.categoryIds || []).includes(c.id)
        );
        this.searchText = '';
        this.dropdownOpen = false;
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.attrForm.reset();
        this.selectedCategories = [];
        this.searchText = '';
        this.dropdownOpen = false;
    }

    // ─── Submit ─────────────────────────────────────────────────────────────────
    onSubmit() {
        if (this.attrForm.invalid) return;
        const name = this.attrForm.value.name;
        const categoryIds = this.selectedCategories.map(c => c.id);

        if (this.isEditing && this.currentAttrId) {
            this.attrService.updateAttribute({ id: this.currentAttrId, name, categoryIds }).subscribe({
                next: () => {
                    this.toastService.success('Attribute updated successfully');
                    this.loadAttributes();
                    this.closeModal();
                },
                error: (err) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to update attribute';
                    this.toastService.error(msg);
                }
            });
        } else {
            this.attrService.createAttribute({ name, categoryIds }).subscribe({
                next: () => {
                    this.toastService.success('Attribute created successfully');
                    this.loadAttributes();
                    this.closeModal();
                },
                error: (err) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to create attribute';
                    this.toastService.error(msg);
                }
            });
        }
    }

    // ─── Delete ─────────────────────────────────────────────────────────────────
    deleteAttribute(id: number) {
        if (confirm('Are you sure you want to delete this attribute?')) {
            this.attrService.deleteAttribute(id).subscribe({
                next: () => {
                    this.toastService.success('Attribute deleted successfully');
                    this.loadAttributes();
                },
                error: (err) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to delete attribute';
                    this.toastService.error(msg);
                }
            });
        }
    }

    getCategoryNames(attr: ProductAttribute): string {
        if (attr.categoryNames?.length) return attr.categoryNames.join(', ');
        if (!attr.categoryIds?.length) return '—';
        return attr.categoryIds
            .map(id => this.categories.find(c => c.id === id)?.name ?? `#${id}`)
            .join(', ');
    }
}
