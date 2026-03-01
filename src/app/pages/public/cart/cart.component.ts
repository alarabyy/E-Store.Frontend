import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from './services/cart.service';
import { UrlPipe } from '../../../components/pipes/url.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { SeoService } from '../../../core/services/seo.service';

export interface AddressForm {
    firstName: string;
    lastName: string;
    streetAddress: string;
    apartmentSuite: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phoneNumber: string;
}

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink, UrlPipe, FormsModule, LoaderComponent],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
    public cartService = inject(CartService);
    private toastService = inject(ToastService);
    private seoService = inject(SeoService);

    isLoading = false;
    showCheckoutModal = false;
    isCheckingOut = false;
    checkoutSuccess: any = null;
    currentStep = 1; // 1: Shipping, 2: Billing, 3: Payment

    shippingAddress: AddressForm = this.emptyAddress();
    billingAddress: AddressForm = this.emptyAddress();
    sameAsShipping = true;
    selectedCurrency = 'EGP';
    selectedCountry = 'EG';
    creditCard = {
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    };

    ngOnInit() {
        this.seoService.setSeoData({
            title: 'Your Cart',
            description: 'Review your selected items and proceed to checkout securely at E-Store. We ensure a seamless shopping experience.',
            keywords: 'cart, checkout, shopping, e-store'
        });

        this.isLoading = true;
        this.cartService.loadFromBackend();
        setTimeout(() => this.isLoading = false, 800);
    }

    private emptyAddress(): AddressForm {
        return {
            firstName: '', lastName: '', streetAddress: '',
            apartmentSuite: '', city: '', state: '',
            zipCode: '', country: 'Egypt', phoneNumber: ''
        };
    }

    increaseQuantity(item: any) {
        this.cartService.updateQuantity(item.id, item.quantity + 1).then(() => {
            this.toastService.show('Quantity updated ✓', 'info');
        });
    }

    decreaseQuantity(item: any) {
        if (item.quantity > 1) {
            this.cartService.updateQuantity(item.id, item.quantity - 1).then(() => {
                this.toastService.show('Quantity updated ✓', 'info');
            });
        } else {
            this.removeItem(item);
        }
    }

    removeItem(item: any) {
        this.cartService.removeFromCart(item.id).then(() => {
            this.toastService.success(`"${item.name}" removed from cart`);
        });
    }

    clearCart() {
        if (!confirm('Are you sure you want to clear your entire cart?')) return;
        this.cartService.clearCart().then(() => {
            this.toastService.show('Cart cleared successfully', 'info');
        });
    }

    openCheckout() {
        if (this.cartService.itemCount === 0) {
            this.toastService.error('Your cart is empty!');
            return;
        }
        this.showCheckoutModal = true;
        this.currentStep = 1;
        this.checkoutSuccess = null;
        document.body.style.overflow = 'hidden';
    }

    closeCheckout() {
        this.showCheckoutModal = false;
        document.body.style.overflow = '';
    }

    nextStep() {
        if (this.currentStep === 1) {
            if (!this.validateAddress(this.shippingAddress)) {
                this.toastService.error('Please fill in all required shipping fields');
                return;
            }
            if (this.sameAsShipping) {
                this.billingAddress = { ...this.shippingAddress };
            }
        }
        if (this.currentStep === 2 && !this.sameAsShipping) {
            if (!this.validateAddress(this.billingAddress)) {
                this.toastService.error('Please fill in all required billing fields');
                return;
            }
        }
        this.currentStep++;
    }

    prevStep() {
        if (this.currentStep > 1) this.currentStep--;
    }

    private validateAddress(addr: AddressForm): boolean {
        return !!(addr.firstName && addr.lastName && addr.streetAddress &&
            addr.city && addr.state && addr.country && addr.phoneNumber);
    }

    async placeOrder() {
        const billing = this.sameAsShipping ? this.shippingAddress : this.billingAddress;

        this.isCheckingOut = true;
        this.toastService.show('Processing your order...', 'info');

        try {
            const result = await this.cartService.checkout({
                currency: this.selectedCurrency,
                country: this.selectedCountry,
                idempotencyKey: `order-${Date.now()}`,
                shippingAddress: this.shippingAddress,
                billingAddress: billing,
                paymentDetails: {
                    cardName: this.creditCard.name,
                    cardNumber: this.creditCard.number,
                    expiry: this.creditCard.expiry,
                    cvv: this.creditCard.cvv
                }
            });

            if (result?.isSuccess && result?.data) {
                this.checkoutSuccess = result.data;
                this.currentStep = 4; // success step
                this.toastService.success(`Order placed! #${result.data.orderNumber}`);
            } else {
                this.toastService.error(result?.error?.message || 'Checkout failed. Please try again.');
            }
        } catch (err: any) {
            this.toastService.error('An error occurred during checkout. Please try again.');
        } finally {
            this.isCheckingOut = false;
        }
    }

    get shippingFee(): number { return 0; }
    get tax(): number { return 0; }
    get grandTotal(): number { return this.cartService.totalPrice + this.shippingFee + this.tax; }
}
