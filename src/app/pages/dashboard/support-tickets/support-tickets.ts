import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportTicketDashboardService } from './services/support-ticket-dashboard.service';
import { SupportTicketDashboardItem, SupportCategory, Priority, TicketStatus } from '../../public/support/models/support.model';
import { PagedRequest } from '../../../components/models/pagination.models';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-support-tickets-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './support-tickets.html',
    styleUrl: './support-tickets.scss',
})
export class SupportTicketsDashboardComponent implements OnInit {
    private ticketService = inject(SupportTicketDashboardService);
    private cdr = inject(ChangeDetectorRef);
    private toastService = inject(ToastService);

    tickets: SupportTicketDashboardItem[] = [];
    selectedTicket: SupportTicketDashboardItem | null = null;
    loading = false;
    actionLoading = false;
    totalCount = 0;
    totalPages = 0;

    pagination: PagedRequest = {
        page: 1,
        pageSize: 10,
        search: ''
    };

    // Enums for template access
    Category = SupportCategory;
    Priority = Priority;
    Status = TicketStatus;

    statusOptions = [
        { value: TicketStatus.Open, label: 'Open' },
        { value: TicketStatus.InProgress, label: 'In Progress' },
        { value: TicketStatus.Resolved, label: 'Resolved' },
        { value: TicketStatus.Closed, label: 'Closed' }
    ];

    ngOnInit(): void {
        this.loadTickets();
    }

    loadTickets(): void {
        this.loading = true;
        this.ticketService.getTickets(this.pagination)
            .pipe(
                finalize(() => {
                    this.loading = false;
                    this.cdr.detectChanges();
                })
            )
            .subscribe({
                next: (response) => {
                    if (response && response.isSuccess) {
                        this.tickets = response.data || [];
                        this.totalCount = response.totalCount || 0;
                        this.totalPages = response.totalPages || 0;
                    }
                },
                error: (err) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to load tickets';
                    this.toastService.error(msg);
                }
            });
    }

    onUpdateStatus(id: number, status: TicketStatus | string): void {
        if (this.actionLoading) return;
        const statusNum = typeof status === 'string' ? parseInt(status) : status;

        this.actionLoading = true;
        this.ticketService.updateStatus(id, statusNum)
            .pipe(finalize(() => {
                this.actionLoading = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (res) => {
                    if (res.isSuccess) {
                        this.toastService.success('Ticket status updated');
                        const ticket = this.tickets.find(t => t.id === id);
                        if (ticket) ticket.status = statusNum;
                        if (this.selectedTicket?.id === id) {
                            this.selectedTicket.status = statusNum;
                        }
                    } else {
                        this.toastService.error('Failed to update status');
                    }
                },
                error: (err) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to update ticket status';
                    this.toastService.error(msg);
                }
            });
    }

    onDelete(id: number): void {
        if (!confirm('Are you sure you want to delete this ticket?')) return;
        if (this.actionLoading) return;
        this.actionLoading = true;
        this.ticketService.deleteTicket(id)
            .pipe(finalize(() => {
                this.actionLoading = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (res) => {
                    if (res.isSuccess) {
                        this.toastService.success('Ticket deleted successfully');
                        this.tickets = this.tickets.filter(t => t.id !== id);
                        this.totalCount--;
                        if (this.selectedTicket?.id === id) this.selectedTicket = null;
                    } else {
                        this.toastService.error('Failed to delete ticket');
                    }
                },
                error: (err) => {
                    const msg = err?.error?.error?.message || err?.error?.message || 'Failed to delete ticket';
                    this.toastService.error(msg);
                }
            });
    }

    onViewDetails(ticket: SupportTicketDashboardItem): void {
        this.selectedTicket = ticket;
    }

    closeDetails(): void {
        this.selectedTicket = null;
    }

    onSearch(): void {
        this.pagination.page = 1;
        this.loadTickets();
    }

    changePage(newPage: number): void {
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.pagination.page = newPage;
            this.loadTickets();
        }
    }

    getCategoryName(category: SupportCategory): string {
        switch (category) {
            case SupportCategory.TechnicalSupport: return 'Technical Support';
            case SupportCategory.BillingAndPayments: return 'Billing & Payments';
            case SupportCategory.SalesAndInquiries: return 'Sales & Inquiries';
            case SupportCategory.GeneralInformation: return 'General Information';
            default: return 'Unknown';
        }
    }

    getPriorityName(priority: Priority): string {
        switch (priority) {
            case Priority.Low: return 'Low';
            case Priority.Medium: return 'Medium';
            case Priority.High: return 'High';
            case Priority.Critical: return 'Critical';
            default: return 'Unknown';
        }
    }

    getStatusName(status: TicketStatus): string {
        switch (status) {
            case TicketStatus.Open: return 'Open';
            case TicketStatus.InProgress: return 'In Progress';
            case TicketStatus.Resolved: return 'Resolved';
            case TicketStatus.Closed: return 'Closed';
            default: return 'Unknown';
        }
    }

    getPriorityClass(priority: Priority): string {
        switch (priority) {
            case Priority.Low: return 'priority-low';
            case Priority.Medium: return 'priority-medium';
            case Priority.High: return 'priority-high';
            case Priority.Critical: return 'priority-critical';
            default: return '';
        }
    }

    getStatusClass(status: TicketStatus): string {
        switch (status) {
            case TicketStatus.Open: return 'status-open';
            case TicketStatus.InProgress: return 'status-progress';
            case TicketStatus.Resolved: return 'status-resolved';
            case TicketStatus.Closed: return 'status-closed';
            default: return '';
        }
    }
}
