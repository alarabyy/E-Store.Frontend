import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FaqService } from './services/faq.service';
import { FAQ, CreateFAQRequest, UpdateFAQRequest } from './models/faq.models';
import { PagedResponse } from '../../../components/models/pagination.models';
import { ApiResponse } from '../../../components/models/api-response.model';
import { ToastService } from '../../../components/toast/services/toast.service';

@Component({
    selector: 'app-faqs',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './faqs.component.html',
    styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent implements OnInit {
    private faqService = inject(FaqService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);
    private toastService = inject(ToastService);

    faqs: FAQ[] = [];
    isLoading = false;

    // Pagination
    page = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 0;

    // Modal / Form
    showModal = false;
    isEditing = false;
    currentFaqId: number | null = null;
    faqForm: FormGroup;

    constructor() {
        this.faqForm = this.fb.group({
            question: ['', [Validators.required, Validators.minLength(5)]],
            answer: ['', [Validators.required, Validators.minLength(10)]],
            isActive: [true]
        });
    }

    ngOnInit() {
        this.loadFaqs();
    }

    loadFaqs() {
        this.isLoading = true;
        this.faqService.getDashboardFaqs(this.page, this.pageSize).subscribe({
            next: (res: any) => {
                // Handle potential double-wrapping of API response
                // If res.data is an array, it's a flat PagedResponse
                // If res.data is an object with a data property, it's a wrapped response
                let items: FAQ[] = [];

                if (res.data && Array.isArray(res.data)) {
                    items = res.data;
                    this.totalCount = res.totalCount;
                    this.totalPages = res.totalPages;
                } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                    items = res.data.data;
                    this.totalCount = res.data.totalCount;
                    this.totalPages = res.data.totalPages;
                }

                this.faqs = items;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                const msg = err?.error?.error?.message || err?.error?.message || 'Failed to load FAQs';
                this.toastService.error(msg);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    onPageChange(newPage: number) {
        this.page = newPage;
        this.loadFaqs();
    }

    openCreateModal() {
        this.isEditing = false;
        this.currentFaqId = null;
        this.faqForm.reset({ isActive: true });
        this.showModal = true;
    }

    openEditModal(faq: FAQ) {
        this.isEditing = true;
        this.currentFaqId = faq.id;
        this.faqForm.patchValue({
            question: faq.question,
            answer: faq.answer,
            isActive: faq.isActive
        });
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.faqForm.reset();
    }

    onSubmit() {
        if (this.faqForm.invalid) return;

        const formValue = this.faqForm.value;

        if (this.isEditing && this.currentFaqId) {
            const request: UpdateFAQRequest = formValue;
            this.faqService.updateFaq(this.currentFaqId, request).subscribe({
                next: (res: ApiResponse<void>) => {
                    this.toastService.success('FAQ updated successfully');
                    this.loadFaqs();
                    this.closeModal();
                },
                error: (err: any) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to update FAQ';
                    this.toastService.error(msg);
                }
            });
        } else {
            const request: CreateFAQRequest = {
                question: formValue.question,
                answer: formValue.answer
            };
            this.faqService.createFaq(request).subscribe({
                next: (res: ApiResponse<number>) => {
                    this.toastService.success('FAQ created successfully');
                    this.loadFaqs();
                    this.closeModal();
                },
                error: (err: any) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to create FAQ';
                    this.toastService.error(msg);
                }
            });
        }
    }

    toggleStatus(id: number) {
        const faq = this.faqs.find(f => f.id === id);
        if (!faq) return;

        // Optimistic Update: Change status immediately
        const previousStatus = faq.isActive;
        faq.isActive = !faq.isActive;

        // Force detection to ensure UI updates instantly
        this.cdr.detectChanges();

        this.faqService.toggleFaqStatus(id).subscribe({
            next: (res: ApiResponse<void>) => {
                this.toastService.success('FAQ status updated successfully');
            },
            error: (err: any) => {
                // Revert on failure
                faq.isActive = previousStatus;
                this.cdr.detectChanges();
                const msg = err?.error?.error?.message || err?.error?.message || 'Failed to update FAQ status';
                this.toastService.error(msg);
            }
        });
    }

    deleteFaq(id: number) {
        if (confirm('Are you sure you want to delete this FAQ?')) {
            this.faqService.deleteFaq(id).subscribe({
                next: (res: ApiResponse<void>) => {
                    this.toastService.success('FAQ deleted successfully');
                    this.loadFaqs();
                },
                error: (err: any) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to delete FAQ';
                    this.toastService.error(msg);
                }
            });
        }
    }
}
