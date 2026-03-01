import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../category.service';
import { Category } from '../category.models';
import { ToastService } from '../../../../core/services/toast.service';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-categories-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './categories-list.component.html',
    styleUrl: './categories-list.component.scss'
})
export class CategoriesListComponent implements OnInit {
    categories: Category[] = [];
    isLoading = true;
    categoryService = inject(CategoryService);
    toastService = inject(ToastService);
    cdr = inject(ChangeDetectorRef);
    backendUrl = environment.backendUrl;

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.isLoading = true;
        this.categoryService.getCategories(1, 100).subscribe({
            next: (res) => {
                this.categories = res.data || [];
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading categories:', err);
                this.toastService.error('Failed to load categories');
                this.isLoading = false;
            }
        });
    }

    getActiveCount() {
        return this.categories.filter(c => c.isActive).length;
    }

    getImageUrl(path: string | null): string {
        if (!path) return 'assets/images/placeholder-cat.png';
        if (path.startsWith('http')) return path;
        return `${this.backendUrl}/${path}`;
    }

    toggleStatus(category: Category) {
        this.categoryService.toggleStatus(category.id).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    category.isActive = !category.isActive;
                    this.toastService.success(`Category ${category.isActive ? 'activated' : 'deactivated'} successfully`);
                } else {
                    this.toastService.error(res.error?.message || 'Failed to update category status');
                }
            },
            error: (err) => {
                const msg = err?.error?.error?.message || err?.error?.message || 'Failed to update category status';
                this.toastService.error(msg);
            }
        });
    }

    deleteCategory(id: number) {
        if (confirm('Are you sure you want to delete this category? This might affect products linked to it.')) {
            this.categoryService.deleteCategory(id).subscribe({
                next: (res) => {
                    if (res.isSuccess) {
                        this.categories = this.categories.filter(c => c.id !== id);
                        this.toastService.success('Category deleted successfully');
                    } else {
                        this.toastService.error(res.error?.message || 'Failed to delete category');
                    }
                },
                error: (err) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to delete category';
                    this.toastService.error(msg);
                }
            });
        }
    }
}
