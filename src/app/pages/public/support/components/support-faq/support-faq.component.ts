
import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqPublicService } from './services/faq-public.service';
import { FAQ } from '../../../../dashboard/faqs/models/faq.models';
import { LoaderComponent } from '../../../../../components/loader/loader.component';

@Component({
    selector: 'app-support-faq',
    standalone: true,
    imports: [CommonModule, LoaderComponent],
    templateUrl: './support-faq.component.html',
    styleUrls: ['./support-faq.component.scss']
})
export class SupportFaqComponent implements OnInit {
    @Output() switchToTicket = new EventEmitter<void>();

    private faqService = inject(FaqPublicService);
    faqs: FAQ[] = [];
    isLoading = true;

    ngOnInit() {
        this.loadFaqs();
    }

    loadFaqs() {
        this.isLoading = true;
        this.faqService.getFaqs().subscribe({
            next: (response) => {
                if (response.isSuccess && response.data) {
                    this.faqs = response.data;
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching FAQs:', err);
                this.isLoading = false;
            }
        });
    }

    onSwitchToTicket() {
        this.switchToTicket.emit();
    }
}
