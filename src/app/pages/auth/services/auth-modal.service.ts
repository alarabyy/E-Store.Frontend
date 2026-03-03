import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root' // Singleton across the app
})
export class AuthModalService {
    private router = inject(Router);
    private modalElement: HTMLDivElement | null = null;

    showRequireLoginModal(): void {
        if (this.modalElement) return; // Prevent multiple modals

        // Create the background overlay
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'auth-modal-overlay';
        this.modalElement.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(8px);
            z-index: 9999999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // Create the modal container
        const modalBox = document.createElement('div');
        modalBox.className = 'auth-modal-box';
        modalBox.style.cssText = `
            background: #ffffff;
            border-radius: 24px;
            padding: 2.5rem 2rem;
            width: 90%;
            max-width: 420px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            transform: scale(0.9);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
        `;

        // Create the close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 20px;
            background: none;
            border: none;
            font-size: 1.8rem;
            color: #64748b;
            cursor: pointer;
            line-height: 1;
            transition: color 0.2s;
        `;
        closeBtn.onmouseover = () => closeBtn.style.color = '#ef4444';
        closeBtn.onmouseleave = () => closeBtn.style.color = '#64748b';
        closeBtn.onclick = () => this.closeModal();

        // Create the icon
        const iconWrap = document.createElement('div');
        iconWrap.style.cssText = `
            width: 70px;
            height: 70px;
            background: rgba(197, 160, 89, 0.15);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
        `;
        const icon = document.createElement('i');
        icon.className = 'ri-lock-2-line';
        icon.style.cssText = `
            font-size: 2rem;
            color: #c5a059; // Gold
        `;
        iconWrap.appendChild(icon);

        // Title
        const title = document.createElement('h2');
        title.innerText = 'Login Required';
        title.style.cssText = `
            font-family: 'Playfair Display', serif;
            font-size: 1.8rem;
            color: #0f172a;
            margin-bottom: 0.8rem;
            font-weight: 800;
        `;

        // Text
        const text = document.createElement('p');
        text.innerText = 'Please log in or create an account to access features like Cart and Wishlist.';
        text.style.cssText = `
            font-size: 1rem;
            color: #64748b;
            margin-bottom: 2rem;
            line-height: 1.5;
        `;

        // Buttons container
        const btnGroup = document.createElement('div');
        btnGroup.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;

        // Login Button
        const loginBtn = document.createElement('button');
        loginBtn.innerText = 'Log In Now';
        loginBtn.style.cssText = `
            background: #0f172a;
            color: #ffffff;
            border: none;
            padding: 14px 24px;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 700;
            font-family: 'Outfit', sans-serif;
            cursor: pointer;
            transition: background 0.25s, transform 0.1s;
        `;
        loginBtn.onmouseover = () => loginBtn.style.background = '#1e293b';
        loginBtn.onmouseleave = () => loginBtn.style.background = '#0f172a';
        loginBtn.onmousedown = () => loginBtn.style.transform = 'scale(0.98)';
        loginBtn.onmouseup = () => loginBtn.style.transform = 'scale(1)';
        loginBtn.onclick = () => {
            this.closeModal();
            this.router.navigate(['/auth/login']);
        };

        // Assemble all pieces
        btnGroup.appendChild(loginBtn);
        modalBox.appendChild(closeBtn);
        modalBox.appendChild(iconWrap);
        modalBox.appendChild(title);
        modalBox.appendChild(text);
        modalBox.appendChild(btnGroup);
        this.modalElement.appendChild(modalBox);

        // Close when clicking overlay (backdrop)
        this.modalElement.onclick = (e) => {
            if (e.target === this.modalElement) this.closeModal();
        };

        // Append to body
        document.body.appendChild(this.modalElement);

        // Trigger animations
        setTimeout(() => {
            if (this.modalElement) {
                this.modalElement.style.opacity = '1';
                modalBox.style.transform = 'scale(1)';
            }
        }, 10);
    }

    closeModal(): void {
        if (!this.modalElement) return;

        const overlay = this.modalElement;
        const modalBox = overlay.querySelector('.auth-modal-box') as HTMLDivElement;

        overlay.style.opacity = '0';
        if (modalBox) modalBox.style.transform = 'scale(0.9)';

        // Remove from DOM after animation
        setTimeout(() => {
            if (overlay.parentElement === document.body) {
                document.body.removeChild(overlay);
            }
            if (this.modalElement === overlay) {
                this.modalElement = null;
            }
        }, 300);
    }
}
