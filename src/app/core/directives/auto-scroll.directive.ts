import { Directive, ElementRef, NgZone, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appAutoScroll]',
    standalone: true
})
export class AutoScrollDirective implements OnInit, OnDestroy {
    private animationFrameId: number | null = null;
    private isPaused = false;
    private speed = 0.25; // extremely slow scroll, pixels per frame
    private listeners: (() => void)[] = [];
    private resumeTimeout: any;

    constructor(private el: ElementRef, private ngZone: NgZone, private renderer: Renderer2) { }

    ngOnInit() {
        this.addEventHandlers();

        // Run animation outside Angular zone to avoid triggering change detection constantly
        this.ngZone.runOutsideAngular(() => {
            this.startScrolling();
        });
    }

    private pauseTemporarily() {
        this.isPaused = true;
        if (this.resumeTimeout) clearTimeout(this.resumeTimeout);
        this.resumeTimeout = setTimeout(() => this.isPaused = false, 2500);
    }

    private addEventHandlers() {
        // Attach to the grandparent (section) to cover navigation arrows
        const target = this.el.nativeElement.closest('.catalog-section') ||
            this.el.nativeElement.parentElement ||
            this.el.nativeElement;

        // Pause on hover
        this.listeners.push(this.renderer.listen(target, 'mouseenter', () => {
            if (this.resumeTimeout) clearTimeout(this.resumeTimeout);
            this.isPaused = true;
        }));
        this.listeners.push(this.renderer.listen(target, 'mouseleave', () => {
            if (this.resumeTimeout) clearTimeout(this.resumeTimeout);
            this.isPaused = false;
        }));

        // Pause on touch and resume after a delay
        this.listeners.push(this.renderer.listen(target, 'touchstart', () => {
            if (this.resumeTimeout) clearTimeout(this.resumeTimeout);
            this.isPaused = true;
        }));
        this.listeners.push(this.renderer.listen(target, 'touchend', () => this.pauseTemporarily()));

        // Pause on wheel/scroll interactions
        this.listeners.push(this.renderer.listen(target, 'wheel', () => this.pauseTemporarily()));
    }

    private startScrolling() {
        const scrollStep = () => {
            if (!this.isPaused) {
                const container = this.el.nativeElement;

                // If we've reached near the end, reset to start smoothly
                if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 4) {
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                    this.pauseTemporarily(); // Pause a bit after reset
                } else {
                    container.scrollLeft += this.speed;
                }
            }
            this.animationFrameId = requestAnimationFrame(scrollStep);
        };
        this.animationFrameId = requestAnimationFrame(scrollStep);
    }

    ngOnDestroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.listeners.forEach(cleanup => cleanup());
    }
}
