import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
    selector: 'app-auth-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, ScrollToTopComponent],
    templateUrl: './auth.layout.html',
    styleUrls: ['./auth.layout.scss']
})
export class AuthLayout { }
