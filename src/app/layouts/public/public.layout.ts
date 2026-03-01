import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-public-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, NavbarComponent, FooterComponent, ScrollToTopComponent],
    templateUrl: './public.layout.html',
    styleUrls: ['./public.layout.scss']
})
export class PublicLayoutComponent {
    authService = inject(AuthService);
}
