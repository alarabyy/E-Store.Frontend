import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductReviewService } from './product-review.service';
import { ProductReview } from './product-review.models';
import { ToastService } from '../../../components/toast/services/toast.service';

@Component({
    selector: 'app-product-reviews',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './product-reviews.component.html',
    styleUrls: ['./product-reviews.component.scss']
})
export class ProductReviewsComponent implements OnInit {
    private reviewService = inject(ProductReviewService);
    private toastService = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);

    reviews: ProductReview[] = [];
    isLoading = false;
    page = 1;
    pageSize = 12;
    totalCount = 0;
    totalPages = 0;

    searchTerm = '';
    selectedRating: number | null = null;
    ratingOptions = [1, 2, 3, 4, 5];

    ngOnInit() {
        this.loadReviews();
    }

    loadReviews() {
        this.isLoading = true;
        this.reviewService.getReviews(
            this.page,
            this.pageSize,
            this.searchTerm || undefined,
            this.selectedRating ?? undefined
        ).subscribe({
            next: (res: any) => {
                if (res.data && Array.isArray(res.data)) {
                    this.reviews = res.data;
                    this.totalCount = res.totalCount;
                    this.totalPages = res.totalPages;
                } else if (res.data?.data) {
                    this.reviews = res.data.data;
                    this.totalCount = res.data.totalCount;
                    this.totalPages = res.data.totalPages;
                }
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.isLoading = false;
                const msg = err?.error?.error?.message || err?.error?.message || 'Failed to load reviews';
                this.toastService.error(msg);
                this.cdr.detectChanges();
            }
        });
    }

    onSearch() {
        this.page = 1;
        this.loadReviews();
    }

    onRatingFilter(rating: number | null) {
        this.selectedRating = rating;
        this.page = 1;
        this.loadReviews();
    }

    onPageChange(newPage: number) {
        this.page = newPage;
        this.loadReviews();
    }

    deleteReview(id: number) {
        if (confirm('Are you sure you want to delete this review?')) {
            this.reviewService.deleteReview(id).subscribe({
                next: () => {
                    this.toastService.success('Review deleted successfully');
                    this.loadReviews();
                },
                error: (err) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to delete review';
                    this.toastService.error(msg);
                }
            });
        }
    }

    getStars(rating: number): number[] {
        return Array.from({ length: 5 }, (_, i) => i + 1);
    }

    getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
}
