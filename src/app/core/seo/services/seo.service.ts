import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoOptions {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    private titleService = inject(Title);
    private metaService = inject(Meta);

    setSeoData(options: SeoOptions) {
        // Standard Tags
        const baseTitle = 'E-Store | Your Tech Partner';
        const pageTitle = options.title ? `${options.title} | ${baseTitle}` : baseTitle;

        this.titleService.setTitle(pageTitle);
        this.metaService.updateTag({ name: 'description', content: options.description });

        if (options.keywords) {
            this.metaService.updateTag({ name: 'keywords', content: options.keywords });
        }

        // Open Graph (Facebook/LinkedIn)
        this.metaService.updateTag({ property: 'og:title', content: pageTitle });
        this.metaService.updateTag({ property: 'og:description', content: options.description });
        this.metaService.updateTag({ property: 'og:type', content: options.type || 'website' });

        if (options.image) {
            this.metaService.updateTag({ property: 'og:image', content: options.image });
        }
        if (options.url) {
            this.metaService.updateTag({ property: 'og:url', content: options.url });
        }

        // Twitter
        this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.metaService.updateTag({ name: 'twitter:title', content: pageTitle });
        this.metaService.updateTag({ name: 'twitter:description', content: options.description });
        if (options.image) {
            this.metaService.updateTag({ name: 'twitter:image', content: options.image });
        }
    }
}
