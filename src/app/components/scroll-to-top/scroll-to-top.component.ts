import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-scroll-to-top',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './scroll-to-top.component.html',
    styleUrl: './scroll-to-top.component.scss'
})
export class ScrollToTopComponent {
    isVisible = signal(false);

    @HostListener('window:scroll', [])
    @HostListener('document:scroll', [])
    onWindowScroll() {
        const verticalOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        this.isVisible.set(verticalOffset > 300);
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}
