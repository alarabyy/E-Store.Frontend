import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from './product.service';
import { Product, AddProductVariantRequest } from './product.models';
import { environment } from '../../../../environments/environment';
import { CategoryService } from '../categories/category.service';
import { Category } from '../categories/category.models';
import { ToastService } from '../../../components/toast/services/toast.service';
import { ProductAttributeService } from '../product-attributes/product-attribute.service';
import { ProductAttribute } from '../product-attributes/product-attribute.models';
import { UrlPipe } from '../../../components/pipes/url.pipe';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, UrlPipe],
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
    private productService = inject(ProductService);
    private categoryService = inject(CategoryService);
    private productAttributeService = inject(ProductAttributeService);
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);

    products: Product[] = [];
    categories: Category[] = [];
    isLoading = false;
    page = 1;
    pageSize = 12;
    totalCount = 0;
    totalPages = 0;

    searchTerm = '';
    selectedCategoryId: number | null = null;

    // Modal
    showModal = false;
    isEditing = false;
    currentProductId: number | null = null;
    isSaving = false;

    // Gallery Lightbox
    galleryProduct: Product | null = null;

    availableAttributes: ProductAttribute[] = [];

    // Images
    selectedImages: File[] = [];
    imagePreviews: string[] = [];
    existingImageUrls: string[] = [];
    newImages: File[] = [];
    newImagePreviews: string[] = [];

    productForm: FormGroup;

    // Variant Modal
    showVariantModal = false;
    variantForm: FormGroup;
    productToManageVariants: Product | null = null;
    showPostCreatePrompt = false;
    newlyCreatedProduct: { id: number, name: string } | null = null;

    variantTypes = ['None', 'Color', 'Size', 'Material', 'Storage', 'RAM'];

    get variant(): FormGroup {
        return this.productForm.get('variant') as FormGroup;
    }

    get attributes(): FormArray {
        return this.productForm.get('attributes') as FormArray;
    }

    constructor() {
        this.productForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            slug: ['', [Validators.required]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            summary: [''],
            categoryId: [null, Validators.required],
            isFeatured: [false],
            isActive: [true],
            variantType: ['None'],
            discountPercentage: [null],
            discountStartDate: [''],
            discountEndDate: [''],
            metaTitle: [''],
            metaDescription: [''],
            variant: this.fb.group({
                name: ['', Validators.required],
                sku: ['', Validators.required],
                price: [0, [Validators.required, Validators.min(0)]],
                salePrice: [null],
                stockQuantity: [0, [Validators.required, Validators.min(0)]],
                _file: [null],
                _preview: [null]
            }),
            attributes: this.fb.array([])
        });

        this.variantForm = this.fb.group({
            name: ['', Validators.required],
            sku: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]],
            salePrice: [null],
            stockQuantity: [0, [Validators.required, Validators.min(0)]],
            _file: [null],
            _preview: [null]
        });
    }

    ngOnInit() {
        this.loadCategories();
        this.loadProducts();
        this.productForm.get('name')?.valueChanges.subscribe(val => {
            if (!this.isEditing) {
                this.productForm.get('slug')?.setValue(this.buildSlug(val), { emitEvent: false });
            }
        });

        this.productForm.get('categoryId')?.valueChanges.subscribe(val => {
            if (val) {
                this.loadAvailableAttributes(val);
            } else {
                this.availableAttributes = [];
                while (this.attributes.length) this.attributes.removeAt(0);
            }
        });
    }

    /** Generate slug supporting both Arabic and English */
    buildSlug(name: string): string {
        if (!name) return '';
        return name
            .trim()
            .toLowerCase()
            .replace(/[\s_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    loadAvailableAttributes(categoryId: number, productAttributes?: any[]) {
        this.productAttributeService.getAttributesByCategory(categoryId).subscribe({
            next: (res) => {
                this.availableAttributes = res.data || [];
                if (!productAttributes) {
                    // Pre-fill attributes if it's a new product or category change without data
                    while (this.attributes.length) this.attributes.removeAt(0);
                    this.availableAttributes.forEach(attr => {
                        this.addAttribute(attr.id, attr.name);
                    });
                }
                this.cdr.detectChanges();
            }
        });
    }

    addAttribute(attrId: number, attrName: string, value: string = '', id: number = 0) {
        this.attributes.push(this.fb.group({
            id: [id],
            attributeId: [attrId, Validators.required],
            attributeName: [attrName],
            value: [value, Validators.required]
        }));
    }

    loadCategories() {
        this.categoryService.getAllActive().subscribe({
            next: (res) => { this.categories = res.data || []; }
        });
    }

    loadProducts() {
        this.isLoading = true;
        this.productService.getProducts(
            this.page, this.pageSize,
            this.selectedCategoryId ?? undefined,
            this.searchTerm || undefined
        ).subscribe({
            next: (res: any) => {
                if (res.data && Array.isArray(res.data)) {
                    this.products = res.data;
                    this.totalCount = res.totalCount;
                    this.totalPages = res.totalPages;
                } else if (res.data?.data) {
                    this.products = res.data.data;
                    this.totalCount = res.data.totalCount;
                    this.totalPages = res.data.totalPages;
                }
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.isLoading = false;
                this.toastService.error('Failed to load products');
                this.cdr.detectChanges();
            }
        });
    }

    onSearch() { this.page = 1; this.loadProducts(); }
    onCategoryFilter(id: number | null) { this.selectedCategoryId = id; this.page = 1; this.loadProducts(); }
    onPageChange(p: number) { this.page = p; this.loadProducts(); }

    // === Variants ===
    openAddVariantModal(product: Product) {
        this.productToManageVariants = product;
        this.variantForm.reset();
        this.showVariantModal = true;
        if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
    }

    closeVariantModal() {
        this.showVariantModal = false;
        this.productToManageVariants = null;
        if (typeof document !== 'undefined') document.body.style.overflow = '';
    }

    onVariantImageChange(event: Event, isNew: boolean = true) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const form = isNew ? this.variantForm : this.variant;
            form.patchValue({ _file: file });

            const reader = new FileReader();
            reader.onload = (e: any) => {
                form.patchValue({ _preview: e.target.result });
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(file);
        }
    }

    removeVariantImage(isNew: boolean = true) {
        const form = isNew ? this.variantForm : this.variant;
        form.patchValue({
            _file: null,
            _preview: null
        });
    }

    onVariantSubmit() {
        if (this.variantForm.invalid || !this.productToManageVariants) {
            this.variantForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const v = this.variantForm.value;
        const req: AddProductVariantRequest = {
            productId: this.productToManageVariants.id,
            name: v.name,
            sku: v.sku,
            price: v.price,
            salePrice: v.salePrice,
            stockQuantity: v.stockQuantity,
            image: v._file
        };

        this.productService.addProductVariant(req).subscribe({
            next: () => {
                this.toastService.success('Variant added successfully');
                this.isSaving = false;
                this.loadProducts();
                this.closeVariantModal();
            },
            error: (err) => {
                this.isSaving = false;
                const msg = err?.error?.error?.message || err?.error?.message || 'Failed to add variant';
                this.toastService.error(msg);
            }
        });
    }

    handlePostCreateChoice(addMore: boolean) {
        this.showPostCreatePrompt = false;
        if (typeof document !== 'undefined') document.body.style.overflow = '';

        if (addMore && this.newlyCreatedProduct) {
            this.openAddVariantModal(this.newlyCreatedProduct as any);
        }
        this.newlyCreatedProduct = null;
    }

    // === Image handling ===
    onImagesChange(event: Event) {
        const files = Array.from((event.target as HTMLInputElement).files || []);
        this.selectedImages = [...this.selectedImages, ...files];
        this.generatePreviews(files, 'create');
    }

    onNewImagesChange(event: Event) {
        const files = Array.from((event.target as HTMLInputElement).files || []);
        this.newImages = [...this.newImages, ...files];
        this.generatePreviews(files, 'edit');
    }

    generatePreviews(files: File[], mode: 'create' | 'edit') {
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                if (mode === 'create') {
                    this.imagePreviews.push(e.target.result);
                } else {
                    this.newImagePreviews.push(e.target.result);
                }
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(file);
        });
    }

    removeNewSelectedImage(index: number, mode: 'create' | 'edit') {
        if (mode === 'create') {
            this.selectedImages.splice(index, 1);
            this.imagePreviews.splice(index, 1);
        } else {
            this.newImages.splice(index, 1);
            this.newImagePreviews.splice(index, 1);
        }
    }

    removeExistingImage(url: string) {
        this.existingImageUrls = this.existingImageUrls.filter(u => u !== url);
    }

    // === Modal ===
    openCreateModal() {
        this.isEditing = false;
        this.currentProductId = null;
        this.selectedImages = [];
        this.imagePreviews = [];
        this.existingImageUrls = [];
        this.newImages = [];
        this.newImagePreviews = [];
        while (this.attributes.length) this.attributes.removeAt(0);
        this.productForm.reset({ isFeatured: false, isActive: true, variantType: 'None' });
        this.variant.enable();
        this.variant.reset({ price: 0, stockQuantity: 0 });
        this.availableAttributes = [];
        if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
        this.showModal = true;
    }

    openEditModal(product: Product) {
        this.isEditing = true;
        this.currentProductId = product.id;
        this.existingImageUrls = product.images.map(i => i.imageUrl);
        this.newImages = [];
        this.newImagePreviews = [];
        this.selectedImages = [];
        this.imagePreviews = [];
        this.availableAttributes = [];

        this.variant.disable();

        while (this.attributes.length) this.attributes.removeAt(0);

        this.productForm.patchValue({
            name: product.name,
            slug: product.slug,
            description: product.description,
            summary: product.summary || '',
            categoryId: product.categoryId,
            isFeatured: product.isFeatured,
            isActive: product.isActive,
            variantType: product.variantType || 'None',
            discountPercentage: product.discountPercentage,
            discountStartDate: product.discountStartDate ? product.discountStartDate.substring(0, 10) : '',
            discountEndDate: product.discountEndDate ? product.discountEndDate.substring(0, 10) : '',
            metaTitle: product.metaTitle || '',
            metaDescription: product.metaDescription || ''
        }, { emitEvent: false });

        // For editing, we don't handle variants in the main form anymore
        // or we only handle the first one? Backend doesn't support variant update in main command.
        // User wants extra forms for variants.
        if (product.attributes && product.attributes.length > 0) {
            this.loadAvailableAttributes(product.categoryId, product.attributes);
            product.attributes.forEach(attr => {
                this.addAttribute(attr.attributeId, attr.attributeName, attr.value, attr.id);
            });
        } else {
            this.loadAvailableAttributes(product.categoryId);
        }

        if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
        this.showModal = true;
    }

    closeModal() {
        if (typeof document !== 'undefined') document.body.style.overflow = '';
        this.showModal = false;
        this.productForm.reset();
    }

    onSubmit() {
        if (this.productForm.invalid) {
            this.productForm.markAllAsTouched();
            this.scrollToFirstInvalid();
            this.toastService.error('Please fill in all required fields');
            return;
        }

        this.isSaving = true;
        const val = this.productForm.value;

        if (this.isEditing && this.currentProductId) {
            const req = {
                id: this.currentProductId,
                name: val.name,
                slug: val.slug,
                description: val.description,
                summary: val.summary,
                categoryId: val.categoryId,
                isFeatured: val.isFeatured,
                isActive: val.isActive,
                existingImages: this.existingImageUrls,
                newImages: this.newImages,
                variantType: val.variantType !== 'None' ? val.variantType : undefined,
                discountPercentage: val.discountPercentage,
                discountStartDate: val.discountStartDate || undefined,
                discountEndDate: val.discountEndDate || undefined,
                metaTitle: val.metaTitle,
                metaDescription: val.metaDescription,
                attributes: val.attributes.map((a: any) => ({
                    attributeId: a.attributeId,
                    value: a.value
                }))
            };
            this.productService.updateProduct(req).subscribe({
                next: () => {
                    this.toastService.success('Product updated successfully');
                    this.isSaving = false;
                    this.loadProducts();
                    this.closeModal();
                },
                error: (err) => {
                    this.isSaving = false;
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to update product';
                    this.toastService.error(msg);
                }
            });
        } else {
            const req = {
                name: val.name,
                slug: val.slug,
                description: val.description,
                summary: val.summary,
                categoryId: val.categoryId,
                isFeatured: val.isFeatured,
                images: this.selectedImages,
                variantType: val.variantType !== 'None' ? val.variantType : undefined,
                discountPercentage: val.discountPercentage,
                discountStartDate: val.discountStartDate || undefined,
                discountEndDate: val.discountEndDate || undefined,
                metaTitle: val.metaTitle,
                metaDescription: val.metaDescription,
                variant: {
                    name: val.variant.name,
                    sku: val.variant.sku,
                    price: val.variant.price,
                    salePrice: val.variant.salePrice,
                    stockQuantity: val.variant.stockQuantity,
                    imageFile: val.variant._file || undefined
                },
                attributes: val.attributes.map((a: any) => ({
                    attributeId: a.attributeId,
                    value: a.value
                }))
            };
            this.productService.createProduct(req as any).subscribe({
                next: (res) => {
                    this.toastService.success('Product created successfully');
                    this.isSaving = false;
                    this.loadProducts();
                    this.closeModal();

                    if (res.data) {
                        this.newlyCreatedProduct = { id: res.data, name: val.name };
                        this.showPostCreatePrompt = true;
                        if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
                    }
                },
                error: (err) => {
                    this.isSaving = false;
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to create product';
                    this.toastService.error(msg);
                }
            });
        }
    }

    deleteProduct(id: number) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.productService.deleteProduct(id).subscribe({
                next: () => { this.toastService.success('Product deleted successfully'); this.loadProducts(); },
                error: (err) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to delete product';
                    this.toastService.error(msg);
                }
            });
        }
    }

    getMainImage(product: Product): string {
        const url = product.images?.[0]?.imageUrl;
        return this.getImageUrl(url);
    }

    getImageUrl(path: string | null | undefined): string {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${environment.backendUrl}/${path}`;
    }

    openGallery(product: Product) {
        this.galleryProduct = product;
        document.body.style.overflow = 'hidden';
    }

    closeGallery() {
        this.galleryProduct = null;
        document.body.style.overflow = '';
    }

    getMinPrice(product: Product): number {
        return product.minPrice || 0;
    }

    private scrollToFirstInvalid() {
        setTimeout(() => {
            const firstInvalidControl = document.querySelector('form .ng-invalid') as HTMLElement;
            if (firstInvalidControl) {
                const element = firstInvalidControl.closest('.form-group') || firstInvalidControl;
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // If it's an input/textarea, focus it
                const input = firstInvalidControl.querySelector('input, textarea, select') as HTMLElement;
                if (input && typeof input.focus === 'function') {
                    input.focus();
                }
            }
        }, 100);
    }

    getTotalStock(product: Product): number {
        if (!product.variants) return 0;
        return product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
    }

    getOriginalPriceRange(product: Product): string {
        if (!product.variants || product.variants.length === 0) return '';
        const prices = product.variants.map(v => v.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (min === max) {
            return min > 0 ? `$${min.toLocaleString()}` : '';
        }
        return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }

    hasPriceDiscount(product: Product): boolean {
        if (product.discountPercentage && product.discountPercentage > 0) return true;
        if (!product.variants || product.variants.length === 0) return false;
        // Check if any variant has a salePrice lower than price
        return product.variants.some(v => v.salePrice && v.salePrice < v.price);
    }
}
