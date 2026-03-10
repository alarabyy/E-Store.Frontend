import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../models/toast.model';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    toasts = signal<Toast[]>([]);

    show(message: string, type: ToastType = 'info', title?: string, duration: number = 3000, position: 'top-right' | 'center' = 'top-right') {
        const id = Math.random().toString(36).substring(2, 9);
        const toast: Toast = { id, message, title, type, duration, position };

        this.toasts.update(current => [...current, toast]);

        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }
    }

    success(message: string, title: string = 'Success!', duration: number = 3000) {
        this.show(message, 'success', title, duration, 'center');
    }

    error(message: string, title: string = 'Error!', duration: number = 3000) {
        this.show(message, 'error', title, duration, 'center');
    }

    info(message: string, title: string = 'Information', duration: number = 3000, position: 'top-right' | 'center' = 'top-right') {
        this.show(message, 'info', title, duration, position);
    }

    remove(id: string) {
        this.toasts.update(current => current.filter(t => t.id !== id));
    }
}
