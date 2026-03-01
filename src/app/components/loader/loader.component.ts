import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="elite-square-chase-overlay" *ngIf="show">
      <div class="loader-container">
        <div class="square-loader"></div>
      </div>
    </div>
  `,
  styles: [`
    .elite-square-chase-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 200000;
    }

    .loader-container {
      width: 60px;
      height: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .square-loader {
      width: 40px;
      aspect-ratio: 1;
      position: relative;
    }

    .square-loader:before,
    .square-loader:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      margin: -10px 0 0 -10px;
      width: 20px;
      aspect-ratio: 1;
      background: #c5a059; /* Elite Gold */
      box-shadow: 0 0 15px rgba(197, 160, 89, 0.3);
      animation:
        l1-1 2s infinite cubic-bezier(0.65, 0, 0.35, 1),
        l1-2 0.5s infinite linear;
    }

    .square-loader:after {
      background: #0f172a; /* Elite Navy */
      box-shadow: 0 0 15px rgba(15, 23, 42, 0.2);
      animation-delay: -1s, 0s;
    }

    @keyframes l1-1 {
      0%   { top: 0; left: 0; }
      25%  { top: 100%; left: 0; }
      50%  { top: 100%; left: 100%; }
      75%  { top: 0; left: 100%; }
      100% { top: 0; left: 0; }
    }

    @keyframes l1-2 {
      80%, 100% { transform: rotate(0.5turn); }
    }
  `]
})
export class LoaderComponent {
  @Input() show = false;
}
