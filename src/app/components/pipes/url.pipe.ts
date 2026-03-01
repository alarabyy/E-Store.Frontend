import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
    name: 'url',
    standalone: true
})
export class UrlPipe implements PipeTransform {
    transform(value: string | undefined | null): string {
        const placeholder = 'https://placehold.co/600x400/f1f5f9/64748b?text=Incomplete+Data';

        if (!value || typeof value !== 'string' || value.trim() === '' || value === 'string') {
            return placeholder;
        }

        // Extremely defensive: if it doesn't look like a path (no extension) and it's not a full URL
        // Example problematic values: 'Collection Name *', 'test', 'string'
        const isPathLike = value.includes('/') || value.includes('.');
        const isUrlLike = value.startsWith('http') || value.startsWith('data:');

        if (!isPathLike && !isUrlLike) {
            return placeholder;
        }

        // Filter out obviously broken placeholders from backend dev
        if (value.includes('*') || value.toLowerCase() === 'null') {
            return placeholder;
        }

        const backendUrl = environment.backendUrl.endsWith('/')
            ? environment.backendUrl.slice(0, -1)
            : environment.backendUrl;

        // Handle full URLs
        if (isUrlLike) {
            if (value.includes('localhost:5000') || value.includes('127.0.0.1:5000')) {
                return value.replace(/http:\/\/(localhost|127\.0\.0\.1):5000/g, backendUrl);
            }
            return value;
        }

        // Handle relative paths (e.g., collections/abc.jpg)
        const normalizedPath = value.replace(/\\/g, '/').replace(/^\/+/, '');

        // If it's a local asset, don't prepend backend URL
        if (normalizedPath.startsWith('assets/')) {
            return normalizedPath.startsWith('/') ? normalizedPath : '/' + normalizedPath;
        }

        return `${backendUrl}/${normalizedPath}`;
    }
}
