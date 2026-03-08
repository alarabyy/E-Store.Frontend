import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from './services/cart.service';
import { UrlPipe } from '../../../components/pipes/url.pipe';
import { ToastService } from '../../../components/toast/services/toast.service';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { SeoService } from '../../../core/seo/services/seo.service';
import { StripeService } from '../../../core/services/stripe.service';
import { environment } from '../../../../environments/environment';

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
    private stripeService = inject(StripeService);

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
    activeGateways: any[] = [];
    selectedPaymentMethod = 'CashOnDelivery';
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
        this.loadAddressesFromLocal();
        setTimeout(() => this.isLoading = false, 800);
    }

    private saveAddressesToLocal() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('checkout_shipping', JSON.stringify(this.shippingAddress));
            localStorage.setItem('checkout_billing', JSON.stringify(this.billingAddress));
            localStorage.setItem('checkout_same_as_shipping', JSON.stringify(this.sameAsShipping));
        }
    }

    private loadAddressesFromLocal() {
        if (typeof window !== 'undefined') {
            const ship = localStorage.getItem('checkout_shipping');
            const bill = localStorage.getItem('checkout_billing');
            const same = localStorage.getItem('checkout_same_as_shipping');

            if (ship) this.shippingAddress = JSON.parse(ship);
            if (bill) this.billingAddress = JSON.parse(bill);
            if (same) this.sameAsShipping = JSON.parse(same);
        }
    }

    private clearCachedAddresses() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('checkout_shipping');
            localStorage.removeItem('checkout_billing');
            localStorage.removeItem('checkout_same_as_shipping');
        }
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

    async openCheckout() {
        if (this.cartService.itemCount === 0) {
            this.toastService.error('Your cart is empty!');
            return;
        }

        this.isLoading = true;
        try {
            const resp = await this.cartService.getActiveGateways();
            if (resp.isSuccess) {
                this.activeGateways = resp.data || [];
                // Default to first gateway if available, else CoD
                if (this.activeGateways.length > 0) {
                    this.selectedPaymentMethod = this.activeGateways[0].name;
                } else {
                    this.selectedPaymentMethod = 'CashOnDelivery';
                }
            }
        } catch (error) {
            console.error('Failed to load gateways', error);
            this.activeGateways = [];
            this.selectedPaymentMethod = 'CashOnDelivery';
        } finally {
            this.isLoading = false;
        }

        this.showCheckoutModal = true;
        this.currentStep = 1;
        this.checkoutSuccess = null;
        document.body.style.overflow = 'hidden';
    }

    closeCheckout() {
        this.showCheckoutModal = false;
        this.stripeService.destroyElements();
        document.body.style.overflow = '';
    }

    async nextStep() {
        this.showErrors = true;
        if (this.currentStep === 1) {
            if (!this.validateAddress(this.shippingAddress)) {
                this.toastService.error('Please fill in all required shipping fields correctly.');
                return;
            }
            if (this.sameAsShipping) {
                this.billingAddress = { ...this.shippingAddress };
            }
            this.saveAddressesToLocal();
        }
        if (this.currentStep === 2) {
            if (!this.sameAsShipping && !this.validateAddress(this.billingAddress)) {
                this.toastService.error('Please fill in all required billing fields correctly.');
                return;
            }
            this.saveAddressesToLocal();

            // Prepare Stripe if selected
            if (this.selectedPaymentMethod === 'Stripe') {
                const stripeGw = this.activeGateways.find(g => g.name === 'Stripe');
                const apiKey = stripeGw?.apiKey || stripeGw?.ApiKey || environment.stripePublicKey;

                if (apiKey) {
                    await this.stripeService.initialize(apiKey);
                    // Minimal delay to ensure element is in DOM if using [hidden]
                    setTimeout(() => {
                        this.stripeService.initializeElements('stripe-card-element');
                    }, 50);
                } else {
                    console.error('Stripe Configuration is missing. Gateway Object:', stripeGw);
                    this.toastService.error('Stripe configuration is missing. Please check backend settings.');
                    return;
                }
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


    async placeOrder() {
        this.showErrors = true;

        const billing = this.sameAsShipping ? this.shippingAddress : this.billingAddress;
        this.isCheckingOut = true;
        let paymentMethodId = null;

        try {
            // Stripe payment method creation
            if (this.selectedPaymentMethod === 'Stripe') {
                this.toastService.show('Verifying card details...', 'info');
                try {
                    const pm = await this.stripeService.createPaymentMethod({
                        name: `${billing.firstName} ${billing.lastName}`,
                        email: '', // add email if available
                        phone: billing.phoneNumber,
                        address: {
                            line1: billing.streetAddress,
                            city: billing.city,
                            state: billing.state,
                            postal_code: billing.zipCode,
                            country: 'EG' // Map properly if needed
                        }
                    });
                    paymentMethodId = pm.id;
                } catch (err: any) {
                    this.toastService.error(err.message || 'Card verification failed.');
                    this.isCheckingOut = false;
                    return;
                }
            }

            this.toastService.show('Processing your order...', 'info');

            const result = await this.cartService.checkout({
                currency: this.selectedCurrency,
                country: this.selectedCountry,
                idempotencyKey: `order-${Date.now()}`,
                shippingAddress: this.shippingAddress,
                billingAddress: billing,
                paymentMethod: this.selectedPaymentMethod,
                paymentMethodId: paymentMethodId,
                paymentDetails: null // No longer sending raw card details
            });

            if (result?.isSuccess && result?.data) {
                const checkoutData = result.data;

                // Handle Asynchronous Actions (Redirects, Stripe 3DS)
                if (checkoutData.status === 'RequiresAction' || checkoutData.redirectUrl) {
                    if (checkoutData.redirectUrl) {
                        this.toastService.show('Redirecting to payment provider...', 'info');
                        window.location.href = checkoutData.redirectUrl;
                        return;
                    }

                    if (this.selectedPaymentMethod === 'Stripe' && checkoutData.actionData?.client_secret) {
                        this.toastService.show('Completing 3D Secure verification...', 'info');
                        try {
                            await this.stripeService.confirmCardPayment(checkoutData.actionData.client_secret);
                            // If it doesn't throw, it's successful (Stripe.js handles redirect/popups)
                            this.checkoutSuccess = checkoutData;
                            this.currentStep = 4;
                            this.cartService.clearCart();
                            this.clearCachedAddresses();
                            this.stripeService.destroyElements();
                            this.toastService.success(`Order placed! #${checkoutData.orderNumber}`);
                        } catch (err: any) {
                            this.toastService.error(err.message || 'Payment authentication failed.');
                        }
                        return;
                    }
                }

                // Normal Success
                this.checkoutSuccess = checkoutData;
                this.currentStep = 4; // success step
                this.cartService.clearCart();
                this.clearCachedAddresses();
                this.stripeService.destroyElements();
                this.toastService.success(`Order placed! #${checkoutData.orderNumber}`);
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
