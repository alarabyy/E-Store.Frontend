import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <button class="mobile-menu-btn" (click)="menuClick.emit()">
            <i class="ri-menu-line"></i>
        </button>
        <h2 class="page-title">Dashboard</h2>
      </div>
      <div class="topbar-actions">
        <!-- <button class="action-btn">🔔</button> Notification placeholder -->
        <div class="user-profile">
             <span class="role-badge">Admin</span>
        </div>
        <button class="action-btn logout-btn" (click)="logout()">Logout</button>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(0,0,0,0.05);
      height: 70px;
    }

    .topbar-left {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .mobile-menu-btn {
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #334155;
        padding: 0.25rem;
    }

    @media (max-width: 768px) {
        .mobile-menu-btn {
            display: block;
        }
        .topbar {
            padding: 1rem;
        }
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
    }

    .topbar-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .action-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: rgba(0,0,0,0.05);
    }

    .logout-btn {
      font-size: 0.9rem;
      color: #dc3545;
      font-weight: 600;
      border: 1px solid #dc3545;
    }

    .logout-btn:hover {
      background: #dc3545;
      color: white;
    }
    
    .role-badge {
        font-size: 0.8rem;
        background: #e0e7ff;
        color: #4f46e5;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 600;
    }
  `]
})
export class AdminNavbarComponent {
  @Output() menuClick = new EventEmitter<void>();
  authService = inject(AuthService);
  router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
