import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Collection, ManageCollectionProductsRequest } from '../../collection.models';
import { Product } from '../../../products/product.models';
import { Category } from '../../../categories/category.models';
import { CollectionService } from '../../collection.service';
import { ProductService } from '../../../products/product.service';
import { CategoryService } from '../../../categories/category.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { UrlPipe } from '../../../../../components/pipes/url.pipe';

@Component({
    selector: 'app-collection-products-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, UrlPipe],
    templateUrl: './collection-products-modal.component.html',
    styleUrls: ['./collection-products-modal.component.scss']
})
export class CollectionProductsModalComponent implements OnInit, OnChanges {
    @Input() show = false;
    @Input() collection: Collection | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    allProducts: Product[] = [];
    categories: Category[] = [];
    selectedProductIds: number[] = [];
    productSearchTerm = '';
    selectedCategoryId: number | null = null;
    isProductsLoading = false;
    isSaving = false;
    expandedProductIds: Set<number> = new Set();

    productViewMode: 'list' | 'grid' = 'list';
    productTab: 'all' | 'selected' = 'all';

    constructor(
        private collectionService: CollectionService,
        private productService: ProductService,
        private categoryService: CategoryService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        this.loadCategories();
        this.loadAllProducts();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['show'] && this.show && this.collection) {
            this.selectedProductIds = this.collection.products?.map(p => p.id) || [];
            this.productTab = 'all';
            this.productSearchTerm = '';
            this.selectedCategoryId = null;
        }
    }

    loadCategories() {
        this.categoryService.getAllActive().subscribe({
            next: (res: any) => {
                this.categories = res.data || res.Data || (Array.isArray(res) ? res : []);
            }
        });
    }

    loadAllProducts() {
        this.isProductsLoading = true;
        this.productService.getProducts(1, 200, this.selectedCategoryId || undefined, this.productSearchTerm).subscribe({
            next: (res: any) => {
                const isSuccess = res.isSuccess ?? res.IsSuccess ?? true;
                if (isSuccess) {
                    let data = res.data ?? res.Data ?? res;
                    if (Array.isArray(data)) {
                        this.allProducts = data;
                    } else if (data && typeof data === 'object') {
                        const items = data.data || data.Data || data.items || data.Items;
                        this.allProducts = Array.isArray(items) ? items : [];
                    }
                }
                this.isProductsLoading = false;
            },
            error: () => {
                this.isProductsLoading = false;
            }
        });
    }

    onSearch() {
        this.loadAllProducts();
    }

    isProductSelected(productId: number): boolean {
        return this.selectedProductIds.includes(productId);
    }

    toggleProduct(productId: number) {
        const index = this.selectedProductIds.indexOf(productId);
        if (index > -1) {
            this.selectedProductIds.splice(index, 1);
        } else {
            this.selectedProductIds.push(productId);
        }
    }

    saveProductAssociations() {
        if (!this.collection) return;

        this.isSaving = true;
        const req: ManageCollectionProductsRequest = {
            collectionId: this.collection.id,
            productIds: this.selectedProductIds
        };

        this.collectionService.manageProducts(req).subscribe({
            next: (res: any) => {
                this.isSaving = false;
                if (res.isSuccess || res.IsSuccess) {
                    this.toastService.success('Products associated successfully');
                    this.saved.emit();
                    this.close.emit();
                } else {
                    this.toastService.error(res.error?.message || 'Failed to associate products');
                }
            },
            error: (err) => {
                this.isSaving = false;
                this.toastService.error(err.error?.message || 'Failed to associate products');
            }
        });
    }

    toggleProductDetails(productId: number, event: Event) {
        event.stopPropagation();
        if (this.expandedProductIds.has(productId)) {
            this.expandedProductIds.delete(productId);
        } else {
            this.expandedProductIds.add(productId);
        }
    }

    isProductExpanded(productId: number): boolean {
        return this.expandedProductIds.has(productId);
    }

    get displayedProducts() {
        let baseList = this.productTab === 'selected'
            ? this.allProducts.filter(p => this.isProductSelected(p.id))
            : this.allProducts;

        if (!this.productSearchTerm) return baseList;

        const term = this.productSearchTerm.toLowerCase();
        return baseList.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.slug?.toLowerCase().includes(term) ||
            p.categoryName?.toLowerCase().includes(term)
        );
    }

    selectAllVisible() {
        this.displayedProducts.forEach(p => {
            if (!this.isProductSelected(p.id)) {
                this.selectedProductIds.push(p.id);
            }
        });
        this.selectedProductIds = [...this.selectedProductIds];
    }

    clearSelection() {
        if (confirm('Clear all selected products?')) {
            this.selectedProductIds = [];
        }
    }
}
