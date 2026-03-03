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
        <button class="mobile-menu-btn" (click)="menuClick.emit()" title="Menu">
            <i class="ri-menu-line"></i>
        </button>
        <div class="page-title-wrapper">
            <h2 class="page-title">Dashboard</h2>
            <span class="page-subtitle">Welcome to your control panel</span>
        </div>
      </div>
      <div class="topbar-actions">
        <div class="user-profile">
            <div class="user-avatar">AD</div>
            <div class="user-details">
                <span class="user-name">Administrator</span>
                <span class="role-badge">Admin</span>
            </div>
        </div>
        <button class="action-btn logout-btn" (click)="logout()" title="Logout">
            <i class="ri-logout-box-line"></i>
            <span>Logout</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2.5rem;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      height: 80px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .topbar-left {
        display: flex;
        align-items: center;
        gap: 1.25rem;
    }

    .mobile-menu-btn {
        display: none;
        background: rgba(0, 0, 0, 0.04);
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #334155;
        padding: 0.5rem;
        border-radius: 10px;
        transition: all 0.3s ease;
        min-width: 40px;
        height: 40px;
        align-items: center;
        justify-content: center;
    }

    .mobile-menu-btn:hover {
        background: rgba(0, 0, 0, 0.08);
        transform: scale(1.05);
    }

    .page-title-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
    }

    .page-subtitle {
        font-size: 0.8rem;
        color: #64748b;
        font-weight: 500;
    }

    @media (max-width: 768px) {
        .mobile-menu-btn {
            display: flex;
        }
        .topbar {
            padding: 1rem 1.5rem;
            height: 70px;
        }
        .page-subtitle {
            display: none;
        }
        .page-title {
            font-size: 1.25rem;
        }
    }

    .topbar-actions {
      display: flex;
      gap: 1.25rem;
      align-items: center;
    }

    .user-profile {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 1rem;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 12px;
        transition: all 0.3s ease;
    }

    .user-profile:hover {
        background: rgba(0, 0, 0, 0.04);
    }

    .user-avatar {
        width: 42px;
        height: 42px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 0.875rem;
        box-shadow: 
            0 4px 12px rgba(99, 102, 241, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transform: rotate(45deg);
            transition: all 0.5s;
        }

        &:hover {
            transform: scale(1.08) rotate(2deg);
            box-shadow: 
                0 6px 20px rgba(99, 102, 241, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);

            &::before {
                left: 100%;
            }
        }
    }

    .user-details {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .user-name {
        font-size: 0.9rem;
        font-weight: 600;
        color: #1e293b;
    }

    .role-badge {
        font-size: 0.7rem;
        background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
        color: #4f46e5;
        padding: 2px 8px;
        border-radius: 6px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .action-btn {
      background: none;
      border: none;
      font-size: 0.95rem;
      cursor: pointer;
      padding: 0.625rem 1.25rem;
      border-radius: 10px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
    }

    .action-btn:hover {
      background: rgba(0, 0, 0, 0.04);
      transform: translateY(-1px);
    }

    .logout-btn {
      color: #dc2626;
      border: 1.5px solid #dc2626;
      background: rgba(220, 38, 38, 0.05);
    }

    .logout-btn:hover {
      background: #dc2626;
      color: white;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      transform: translateY(-2px);
    }

    .logout-btn i {
        font-size: 1.1rem;
    }

    @media (max-width: 640px) {
        .user-details {
            display: none;
        }
        .logout-btn span {
            display: none;
        }
        .logout-btn {
            padding: 0.625rem;
            min-width: 40px;
            justify-content: center;
        }
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
