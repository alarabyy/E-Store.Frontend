import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionService } from './collection.service';
import { Collection } from './collection.models';
import { ToastService } from '../../../core/services/toast.service';
import { CollectionCardComponent } from './components/collection-card/collection-card.component';
import { CollectionFormModalComponent } from './components/collection-form-modal/collection-form-modal.component';
import { CollectionProductsModalComponent } from './components/collection-products-modal/collection-products-modal.component';

@Component({
    selector: 'app-collections',
    standalone: true,
    imports: [
        CommonModule,
        CollectionCardComponent,
        CollectionFormModalComponent,
        CollectionProductsModalComponent
    ],
    templateUrl: './collections.component.html',
    styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {
    collections: Collection[] = [];
    private allCollectionsBackup: Collection[] = [];
    isLoading = false;

    // Modal Control
    showFormModal = false;
    showProductModal = false;
    currentCollection: Collection | null = null;

    constructor(
        private collectionService: CollectionService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        this.loadCollections();
    }

    loadCollections() {
        this.isLoading = true;
        this.collectionService.getCollections(1, 100).subscribe({
            next: (res: any) => {
                const data = res?.data || res?.Data || (Array.isArray(res) ? res : []);
                if (Array.isArray(data)) {
                    this.collections = data;
                    this.allCollectionsBackup = [...data];
                } else if (data && typeof data === 'object') {
                    const items = data.items || data.Items || data.data || data.Data || [];
                    this.collections = items;
                    this.allCollectionsBackup = [...items];
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Collections load error:', err);
                this.isLoading = false;
            }
        });
    }

    openCreateModal() {
        this.currentCollection = null;
        this.showFormModal = true;
    }

    openEditModal(collection: Collection) {
        this.currentCollection = collection;
        this.showFormModal = true;
    }

    openManageProducts(collection: Collection) {
        this.currentCollection = collection;
        this.showProductModal = true;
    }

    deleteCollection(id: number) {
        if (confirm('Are you sure you want to delete this collection?')) {
            this.collectionService.deleteCollection(id).subscribe({
                next: () => {
                    this.toastService.success('Collection deleted successfully');
                    this.loadCollections();
                },
                error: (err) => {
                    this.toastService.error(err.error?.message || 'Failed to delete collection');
                }
            });
        }
    }

    getActiveCount(): number {
        return this.collections.filter(c => c.isActive).length;
    }

    filterCollections(event: any) {
        const query = (event.target as HTMLInputElement).value.toLowerCase().trim();
        if (!query) {
            this.collections = [...this.allCollectionsBackup];
            return;
        }
        this.collections = this.allCollectionsBackup.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.slug.toLowerCase().includes(query)
        );
    }
}
