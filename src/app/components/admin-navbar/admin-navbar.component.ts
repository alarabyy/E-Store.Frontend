import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../pages/auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-navbar',
    standalone: true,
    imports: [CommonModule],
    template: `
    <header class="topbar">
      <div class="topbar-left">
        <button class="mobile-menu-btn" (click)="menuClick.emit()" title="Menu">
            <i class="ri-menu-2-line"></i>
        </button>
        <div class="page-title-wrapper">
            <h2 class="page-title">Dashboard</h2>
            <p class="page-subtitle">Real-time system insight</p>
        </div>
      </div>
      <div class="topbar-actions">
        <div class="user-profile">
            <div class="user-avatar shadow-sm">AD</div>
            <div class="user-details">
                <span class="user-name">Administrator</span>
                <span class="role-badge">System Root</span>
            </div>
        </div>
        <button class="action-btn logout-btn" (click)="logout()" title="Logout">
            <i class="ri-shut-down-line"></i>
            <span>Log out</span>
        </button>
      </div>
    </header>
  `,
    styles: [`
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2.5rem;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(15, 23, 42, 0.08);
      height: 90px;
      position: sticky;
      top: 0;
      z-index: 100;
      transition: all 0.3s ease;
    }

    .topbar-left {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .mobile-menu-btn {
        display: none;
        background: #0f172a;
        border: none;
        font-size: 1.4rem;
        cursor: pointer;
        color: #fff;
        padding: 0.6rem;
        border-radius: 12px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
    }

    .page-title-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
    }

    .page-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.6rem;
      font-weight: 900;
      color: #0f172a;
      margin: 0;
      line-height: 1.1;
    }

    .page-subtitle {
        font-size: 0.85rem;
        color: #64748b;
        font-weight: 600;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    @media (max-width: 768px) {
        .mobile-menu-btn { display: flex; }
        .topbar { padding: 0 1.5rem; height: 80px; }
        .page-subtitle { display: none; }
        .page-title { font-size: 1.4rem; }
    }

    .topbar-actions {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .user-profile {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.6rem 1.2rem;
        background: rgba(15, 23, 42, 0.03);
        border-radius: 16px;
        border: 1px solid rgba(0, 0, 0, 0.02);
    }

    .user-avatar {
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #0f172a, #1e293b);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #c5a059;
        font-weight: 800;
        font-size: 0.9rem;
        border: 2px solid #c5a059;
    }

    .user-name {
        font-size: 0.95rem;
        font-weight: 800;
        color: #0f172a;
        display: block;
    }

    .role-badge {
        font-size: 0.7rem;
        color: #c5a059;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }

    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.8rem 1.4rem;
      border-radius: 14px;
      transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .logout-btn {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.06);
      border: 1px solid rgba(239, 68, 68, 0.1);
    }

    .logout-btn:hover {
      background: #ef4444;
      color: white;
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
    }

    @media (max-width: 640px) {
        .user-details, .logout-btn span { display: none; }
        .logout-btn { padding: 0.8rem; min-width: 44px; justify-content: center; }
        .user-profile { padding: 0.4rem; background: none; border: none; }
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
