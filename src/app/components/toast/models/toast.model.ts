export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    title?: string;
    type: ToastType;
    duration: number;
    position?: 'top-right' | 'center';
}
