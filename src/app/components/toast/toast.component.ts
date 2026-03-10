import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Top Right Container (Side Notification Panel Style) -->
    <div class="toast-container top-right">
      @for (toast of cornerToasts(); track toast.id) {
        <div class="toast" [class]="toast.type" (click)="toastService.remove(toast.id)">
          <div class="icon">
            <i class="ri-check-line" *ngIf="toast.type === 'success'"></i>
            <i class="ri-error-warning-line" *ngIf="toast.type === 'error'"></i>
            <i class="ri-information-line" *ngIf="toast.type === 'info'"></i>
          </div>
          <div class="content">{{ toast.message }}</div>
          <button class="close-btn">&times;</button>
        </div>
      }
    </div>

    <!-- Center Overlay Container -->
    <div class="toast-center-overlay" *ngIf="centerToasts().length > 0">
      @for (toast of centerToasts(); track toast.id) {
        <div class="toast-center center-toast" [class]="toast.type" (click)="toastService.remove(toast.id)">
          <div class="center-icon-wrapper" [class]="toast.type">
            <i class="ri-check-line" *ngIf="toast.type === 'success'"></i>
            <i class="ri-close-line" *ngIf="toast.type === 'error'"></i>
            <i class="ri-information-line" *ngIf="toast.type === 'info'"></i>
          </div>
          <div class="center-content">
            <h3>{{ toast.title || (toast.type === 'success' ? 'Success!' : toast.type === 'error' ? 'Error!' : 'Info') }}</h3>
            <p>{{ toast.message }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 15px;
      pointer-events: none;
    }

    .top-right {
      top: 30px;
      right: 0;
      align-items: flex-end;
    }

    .toast-center-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: auto;
    }

    .toast {
      pointer-events: auto;
      background: #ffffff;
      min-width: 320px;
      max-width: 400px;
      padding: 1.2rem 1.5rem;
      border-radius: 12px 0 0 12px;
      box-shadow: -5px 5px 20px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 15px;
      animation: slideInSide 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      border-left: 6px solid #cbd5e1;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .toast::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: inherit;
      width: 100%;
      animation: progress 3s linear forwards;
    }

    .toast.success { border-left-color: #10b981; }
    .toast.success .icon { color: #10b981; }
    .toast.success::after { background: #10b981; }

    .toast.error { border-left-color: #ef4444; }
    .toast.error .icon { color: #ef4444; }
    .toast.error::after { background: #ef4444; }

    .toast.info { border-left-color: #3b82f6; }
    .toast.info .icon { color: #3b82f6; }
    .toast.info::after { background: #3b82f6; }

    .toast .icon {
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      background: #f8fafc;
      width: 40px;
      height: 40px;
      justify-content: center;
      border-radius: 50%;
    }

    .toast .content {
      flex: 1;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }

    .toast .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #94a3b8;
      cursor: pointer;
      padding: 5px;
      line-height: 1;
      transition: color 0.2s;
    }
    .toast .close-btn:hover { color: #0f1111; }

    .toast-center {
      background: white;
      padding: 2.5rem;
      border-radius: 20px;
      box-shadow: 0 10px 50px rgba(0,0,0,0.2);
      border: none;
      min-width: 350px;
      max-width: 500px;
      flex-direction: column;
      text-align: center;
      animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      display: flex;
    }

    .toast-center .center-icon-wrapper {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      margin-left: auto;
      margin-right: auto;
    }
    
    .toast-center .center-icon-wrapper.success { background: #dcfce7; color: #16a34a; }
    .toast-center .center-icon-wrapper.error { background: #fee2e2; color: #dc2626; }
    .toast-center .center-icon-wrapper.info { background: #dbeafe; color: #2563eb; }

    .toast-center .center-content h3 {
      margin: 0 0 0.8rem 0;
      font-size: 1.8rem;
      font-weight: 800;
      color: #1e293b;
    }

    .toast-center .center-content p {
      margin: 0;
      color: #64748b;
      font-size: 1.05rem;
      line-height: 1.6;
    }

    @keyframes slideInSide {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes popIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  cornerToasts = computed(() =>
    this.toastService.toasts().filter(t => !t.position || t.position === 'top-right')
  );

  centerToasts = computed(() =>
    this.toastService.toasts().filter(t => t.position === 'center')
  );
}

