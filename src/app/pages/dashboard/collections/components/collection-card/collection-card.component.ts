import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Collection } from '../../collection.models';
import { UrlPipe } from '../../../../../components/pipes/url.pipe';

@Component({
    selector: 'app-collection-card',
    standalone: true,
    imports: [CommonModule, RouterModule, UrlPipe],
    templateUrl: './collection-card.component.html',
    styleUrls: ['./collection-card.component.scss']
})
export class CollectionCardComponent {
    @Input({ required: true }) collection!: Collection;
    @Output() manageProducts = new EventEmitter<Collection>();
    @Output() edit = new EventEmitter<Collection>();
    @Output() delete = new EventEmitter<number>();
}
