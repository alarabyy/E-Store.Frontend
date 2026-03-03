
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../../core/seo/services/seo.service';
import { SupportTicketsComponent } from './components/support-tickets/support-tickets.component';
import { SupportFaqComponent } from './components/support-faq/support-faq.component';

@Component({
    selector: 'app-support',
    standalone: true,
    imports: [
        CommonModule,
        SupportTicketsComponent,
        SupportFaqComponent
    ],
    templateUrl: './support.component.html',
    styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {
    private seoService = inject(SeoService);

    activeTab: 'ticket' | 'faq' = 'ticket';

    ngOnInit() {
        this.seoService.setSeoData({
            title: 'Help & Support',
            description: 'Get help with your orders, browse frequently asked questions, or contact our support team directly. We are here to assist you.',
            keywords: 'support, help, contact, faq, customer service, e-store'
        });
    }

    setActiveTab(tab: 'ticket' | 'faq') {
        this.activeTab = tab;
    }
}
