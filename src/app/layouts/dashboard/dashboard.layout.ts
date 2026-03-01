import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LogoComponent } from '../../components/logo/logo.component';
import { AdminNavbarComponent } from '../../components/admin-navbar/admin-navbar.component';

@Component({
    selector: 'app-dashboard-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, LogoComponent, AdminNavbarComponent],
    templateUrl: './dashboard.layout.html',
    styleUrls: ['./dashboard.layout.scss']
})
export class DashboardLayoutComponent {
    isSidebarCollapsed = signal(false);
    isMobileSidebarOpen = signal(false);

    toggleSidebar() {
        this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
    }

    toggleMobileSidebar() {
        this.isMobileSidebarOpen.set(!this.isMobileSidebarOpen());
    }

    closeMobileSidebar() {
        this.isMobileSidebarOpen.set(false);
    }
}
