import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SupportTicketService } from '../../services/support-ticket.service';
import { CreateSupportTicketRequest, SupportCategory, Priority } from '../../models/support.model';

@Component({
  selector: 'app-support-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './support-tickets.component.html',
  styleUrls: ['./support-tickets.component.scss']
})
export class SupportTicketsComponent {
  private supportTicketService = inject(SupportTicketService);

  isSubmitting = false;
  showSuccess = false;
  errorMessage = '';
  ticketId: string | null = null;

  ticketForm = {
    name: '',
    email: '',
    subject: '',
    category: '1', // Default to TechnicalSupport
    priority: '2', // Default to Medium
    message: ''
  };

  categories = [
    { id: '1', name: 'Technical Support' },
    { id: '2', name: 'Billing & Payments' },
    { id: '3', name: 'Sales & Inquiries' },
    { id: '4', name: 'General Information' }
  ];

  priorities = [
    { id: '1', name: 'Low' },
    { id: '2', name: 'Medium' },
    { id: '3', name: 'High' },
    { id: '4', name: 'Critical' }
  ];

  submitTicket() {
    if (!this.ticketForm.name || !this.ticketForm.email || !this.ticketForm.subject || !this.ticketForm.message) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.showSuccess = false;

    const request: CreateSupportTicketRequest = {
      fullName: this.ticketForm.name,
      email: this.ticketForm.email,
      subject: this.ticketForm.subject,
      category: parseInt(this.ticketForm.category) as SupportCategory,
      priority: parseInt(this.ticketForm.priority) as Priority,
      message: this.ticketForm.message
    };

    this.supportTicketService.createTicket(request).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.isSuccess) {
          this.showSuccess = true;
          this.ticketId = response.data || null;
          this.resetForm();
        } else {
          this.errorMessage = response.error?.message || 'Something went wrong. Please try again.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to connect to the server. Please check your internet connection.';
        console.error('Ticket submission error:', err);
      }
    });
  }

  private resetForm() {
    this.ticketForm = {
      name: '',
      email: '',
      subject: '',
      category: '1',
      priority: '2',
      message: ''
    };
  }
}
