import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';
import { LoaderComponent } from './components/loader/loader.component';
import { LoaderService } from './components/loader/services/loader.service';
import { CommonModule } from '@angular/common';

declare var AOS: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, LoaderComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('e-store');

  constructor(private router: Router, public loaderService: LoaderService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loaderService.show();
      }
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        // Artificially wait a bit for data to load if needed, otherwise hide
        setTimeout(() => this.loaderService.hide(), 800);
      }
      if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loaderService.hide();
      }
    });
  }

  ngOnInit() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 1000,
        once: true,
        mirror: false
      });
    }
  }
}
