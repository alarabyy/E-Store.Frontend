import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CollectionService } from '../catalog/services/collection.service';
import { UrlPipe } from '../../../components/pipes/url.pipe';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo.service';

@Component({
    selector: 'app-collection-details',
    standalone: true,
    imports: [CommonModule, RouterLink, UrlPipe, ProductCardComponent, LoaderComponent],
    templateUrl: './collection-details.component.html',
    styleUrls: ['./collection-details.component.scss']
})
export class CollectionDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private collectionService = inject(CollectionService);
    private titleService = inject(Title);
    private metaService = inject(Meta);
    private seoService = inject(SeoService);

    collection: any = null;
    isLoading = true;
    error = false;

    ngOnInit() {
        this.route.params.subscribe(params => {
            const slug = params['slug'];
            if (slug) {
                this.loadCollection(slug);
            }
        });
    }

    loadCollection(slug: string) {
        this.isLoading = true;
        this.collectionService.getCollectionBySlug(slug).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.collection = res.data;
                    this.updateMetaTags();
                } else {
                    this.error = true;
                }
                this.isLoading = false;
            },
            error: () => {
                this.error = true;
                this.isLoading = false;
            }
        });
    }

    private updateMetaTags() {
        if (!this.collection) return;

        const title = this.collection.metaTitle || this.collection.name;
        const description = this.collection.metaDescription || this.collection.description || `Explore ${this.collection.name} at E-Store.`;

        this.seoService.setSeoData({
            title: title,
            description: description,
            keywords: `${this.collection.name}, collection, buy online, premium`,
            image: this.collection.imageUrl,
            type: 'article'
        });
    }
}
