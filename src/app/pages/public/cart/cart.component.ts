import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from './services/cart.service';
import { UrlPipe } from '../../../components/pipes/url.pipe';
import { ToastService } from '../../../components/toast/services/toast.service';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { SeoService } from '../../../core/seo/services/seo.service';

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
    showErrors = false;

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
        this.cartService.loadFromLocalStorage();
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
        this.cartService.updateQuantity(item.id, item.quantity + 1);
        this.toastService.show('Quantity updated ✓', 'info');
    }

    decreaseQuantity(item: any) {
        if (item.quantity > 1) {
            this.cartService.updateQuantity(item.id, item.quantity - 1);
            this.toastService.show('Quantity updated ✓', 'info');
        } else {
            this.removeItem(item);
        }
    }

    removeItem(item: any) {
        this.cartService.removeFromCart(item.id);
        this.toastService.success(`"${item.name}" removed from cart`);
    }

    clearCart() {
        if (!confirm('Are you sure you want to clear your entire cart?')) return;
        this.cartService.clearCart();
        this.toastService.show('Cart cleared successfully', 'info');
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
        this.showErrors = true;
        if (this.currentStep === 1) {
            if (!this.validateAddress(this.shippingAddress)) {
                this.toastService.error('Please fill in all required shipping fields correctly.');
                return;
            }
            if (this.sameAsShipping) {
                this.billingAddress = { ...this.shippingAddress };
            }
        }
        if (this.currentStep === 2 && !this.sameAsShipping) {
            if (!this.validateAddress(this.billingAddress)) {
                this.toastService.error('Please fill in all required billing fields correctly.');
                return;
            }
        }
        this.showErrors = false;
        this.currentStep++;
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showErrors = false;
        }
    }

    validateAddress(addr: AddressForm): boolean {
        const phoneRegex = /^[+0-9\s-]{8,20}$/;
        return !!(
            addr.firstName?.trim() &&
            addr.lastName?.trim() &&
            addr.streetAddress?.trim() &&
            addr.city?.trim() &&
            addr.state?.trim() &&
            addr.country?.trim() &&
            addr.phoneNumber?.trim() &&
            phoneRegex.test(addr.phoneNumber.trim())
        );
    }

    validateCard(): boolean {
        const nr = this.creditCard.number.replace(/\s/g, '');
        if (nr.length < 15 || nr.length > 16 || !/^\d+$/.test(nr)) return false;
        if (!this.creditCard.name?.trim()) return false;
        if (!/^\d{2}\/\d{2}$/.test(this.creditCard.expiry)) return false;
        if (!/^\d{3,4}$/.test(this.creditCard.cvv)) return false;
        return true;
    }

    formatCardNumber(event: any) {
        let val = event.target.value.replace(/\D/g, '');
        let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        this.creditCard.number = formatted;
        event.target.value = formatted;
    }

    formatExpiry(event: any) {
        let val = event.target.value.replace(/\D/g, '');
        if (val.length >= 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        this.creditCard.expiry = val;
        event.target.value = val;
    }

    formatCVV(event: any) {
        let val = event.target.value.replace(/\D/g, '');
        this.creditCard.cvv = val;
        event.target.value = val;
    }

    isInvalidCardNumber(): boolean {
        const nr = this.creditCard.number.replace(/\s/g, '');
        return nr.length < 15 || nr.length > 16 || !/^\d+$/.test(nr);
    }

    isInvalidExpiry(): boolean {
        return !/^\d{2}\/\d{2}$/.test(this.creditCard.expiry);
    }

    isInvalidCVV(): boolean {
        return !/^\d{3,4}$/.test(this.creditCard.cvv);
    }

    async placeOrder() {
        this.showErrors = true;
        if (!this.validateCard()) {
            this.toastService.error('Please enter valid credit card details.');
            return;
        }

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
