import { Component, inject, OnInit, signal, ElementRef, ViewChild, ChangeDetectorRef, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from './services/cart.service';
import { UrlPipe } from '../../../components/pipes/url.pipe';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';
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
    styleUrls: ['./cart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit {
    public cartService = inject(CartService);
    private toastService = inject(ToastService);
    private seoService = inject(SeoService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);
    private stripeService = inject(StripeService);

    @ViewChild('cartScroll') cartScroll!: ElementRef<HTMLDivElement>;
    @ViewChild('itemsList') itemsList!: ElementRef<HTMLDivElement>;

    // Signals for state
    isLoading = signal(false);
    showCheckoutModal = signal(false);
    isCheckingOut = signal(false);
    checkoutSuccess = signal<any>(null);
    currentStep = signal(1); // 1: Shipping, 2: Billing, 3: Payment
    showErrors = signal(false);
    showFilters = signal(false); // Mobile sidebar toggle

    // Filters as signals
    searchQuery = signal('');
    sortBy = signal('default');
    minPrice = signal<number | null>(null);
    maxPrice = signal<number | null>(null);

    shippingAddress = signal<AddressForm>(this.emptyAddress());
    billingAddress = signal<AddressForm>(this.emptyAddress());
    sameAsShipping = signal(true);
    selectedCurrency = signal('EGP');
    selectedCountry = signal('EG');
    activeGateways = signal<any[]>([]);
    selectedPaymentMethod = signal('CashOnDelivery');

    creditCard = signal({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    ngOnInit() {
        if (!this.authService.isAuthenticated()) {
            this.toastService.error('You need to login to view your cart.');
            this.router.navigate(['/auth/login']);
            return;
        }

        this.seoService.setSeoData({
            title: 'Your Cart - Premium Experience',
            description: 'Review your selected items and proceed to checkout securely at E-Store. We ensure a seamless shopping experience.',
            keywords: 'cart, checkout, shopping, e-store'
        });

        this.isLoading.set(true);
        this.cartService.loadFromLocalStorage();
        this.loadAddressesFromLocal();
        setTimeout(() => {
            this.isLoading.set(false);
            this.cdr.markForCheck();
        }, 800);
    }

    private saveAddressesToLocal() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('checkout_shipping', JSON.stringify(this.shippingAddress()));
            localStorage.setItem('checkout_billing', JSON.stringify(this.billingAddress()));
            localStorage.setItem('checkout_same_as_shipping', JSON.stringify(this.sameAsShipping()));
        }
    }

    private loadAddressesFromLocal() {
        if (typeof window !== 'undefined') {
            const ship = localStorage.getItem('checkout_shipping');
            const bill = localStorage.getItem('checkout_billing');
            const same = localStorage.getItem('checkout_same_as_shipping');

            if (ship) this.shippingAddress.set(JSON.parse(ship));
            if (bill) this.billingAddress.set(JSON.parse(bill));
            if (same) this.sameAsShipping.set(JSON.parse(same));
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

    get filteredItems() {
        let items = this.cartService.items();
        const sq = this.searchQuery().toLowerCase();
        const minP = this.minPrice();
        const maxP = this.maxPrice();
        const sort = this.sortBy();

        if (sq) {
            items = items.filter((item: any) => item.name.toLowerCase().includes(sq));
        }

        if (minP !== null) {
            items = items.filter((item: any) => item.price >= minP);
        }

        if (maxP !== null) {
            items = items.filter((item: any) => item.price <= maxP);
        }

        if (sort === 'price-asc') {
            items = [...items].sort((a: any, b: any) => a.price - b.price);
        } else if (sort === 'price-desc') {
            items = [...items].sort((a: any, b: any) => b.price - a.price);
        } else if (sort === 'name-asc') {
            items = [...items].sort((a: any, b: any) => a.name.localeCompare(b.name));
        }

        return items;
    }

    toggleFilters() {
        this.showFilters.update(v => !v);
    }

    clearAllFilters() {
        this.searchQuery.set('');
        this.minPrice.set(null);
        this.maxPrice.set(null);
        this.sortBy.set('default');
    }

    setPriceRange(min: number | null, max: number | null) {
        this.minPrice.set(min);
        this.maxPrice.set(max);
    }

    async openCheckout() {
        if (!this.authService.isAuthenticated()) {
            this.toastService.error('You must log in before proceeding to checkout.');
            this.router.navigate(['/auth/login']);
            return;
        }

        if (this.cartService.itemCount() === 0) {
            this.toastService.error('Your cart is empty!');
            return;
        }

        this.isLoading.set(true);
        try {
            const resp = await this.cartService.getActiveGateways();
            if (resp.isSuccess) {
                this.activeGateways.set(resp.data || []);
                // Default to first gateway if available, else CoD
                const gateways = this.activeGateways();
                if (gateways.length > 0) {
                    this.selectedPaymentMethod.set(gateways[0].name);
                } else {
                    this.selectedPaymentMethod.set('CashOnDelivery');
                }
            }
        } catch (error) {
            console.error('Failed to load gateways', error);
            this.activeGateways.set([]);
            this.selectedPaymentMethod.set('CashOnDelivery');
        } finally {
            this.isLoading.set(false);
        }

        this.showCheckoutModal.set(true);
        this.currentStep.set(1);
        this.checkoutSuccess.set(null);
        document.body.style.overflow = 'hidden';
    }

    closeCheckout() {
        this.showCheckoutModal.set(false);
        this.stripeService.destroyElements();
        document.body.style.overflow = '';
    }

    async nextStep() {
        this.showErrors.set(true);
        if (this.currentStep() === 1) {
            if (!this.validateAddress(this.shippingAddress())) {
                this.toastService.error('Please fill in all required shipping fields correctly.');
                return;
            }
            if (this.sameAsShipping()) {
                this.billingAddress.set({ ...this.shippingAddress() });
            }
            this.saveAddressesToLocal();
        }
        if (this.currentStep() === 2) {
            if (!this.sameAsShipping() && !this.validateAddress(this.billingAddress())) {
                this.toastService.error('Please fill in all required billing fields correctly.');
                return;
            }
            this.saveAddressesToLocal();

            // Prepare Stripe if selected
            if (this.selectedPaymentMethod() === 'Stripe') {
                const gateways = this.activeGateways();
                const stripeGw = gateways.find((g: any) => g.name === 'Stripe');
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
        this.showErrors.set(false);
        this.currentStep.update(s => s + 1);
    }

    prevStep() {
        if (this.currentStep() > 1) {
            this.currentStep.update(s => s - 1);
            this.showErrors.set(false);
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
        const card = this.creditCard();
        const nr = card.number.replace(/\s/g, '');
        if (nr.length < 15 || nr.length > 16 || !/^\d+$/.test(nr)) return false;
        if (!card.name?.trim()) return false;
        if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return false;
        if (!/^\d{3,4}$/.test(card.cvv)) return false;
        return true;
    }

    updateShippingAddress(field: keyof AddressForm, value: any) {
        this.shippingAddress.update(addr => ({ ...addr, [field]: value }));
    }

    updateBillingAddress(field: keyof AddressForm, value: any) {
        this.billingAddress.update(addr => ({ ...addr, [field]: value }));
    }

    updateCreditCard(field: string, value: any) {
        this.creditCard.update(card => ({ ...card, [field]: value }));
    }

    formatCardNumber(event: any) {
        let val = event.target.value.replace(/\D/g, '');
        let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        this.updateCreditCard('number', formatted);
        event.target.value = formatted;
    }

    formatExpiry(event: any) {
        let val = event.target.value.replace(/\D/g, '');
        if (val.length >= 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        this.updateCreditCard('expiry', val);
        event.target.value = val;
    }

    formatCVV(event: any) {
        let val = event.target.value.replace(/\D/g, '');
        this.updateCreditCard('cvv', val);
        event.target.value = val;
    }

    isInvalidCardNumber(): boolean {
        const nr = this.creditCard().number.replace(/\s/g, '');
        return nr.length < 15 || nr.length > 16 || !/^\d+$/.test(nr);
    }

    isInvalidExpiry(): boolean {
        return !/^\d{2}\/\d{2}$/.test(this.creditCard().expiry);
    }

    isInvalidCVV(): boolean {
        return !/^\d{3,4}$/.test(this.creditCard().cvv);
    }

    async placeOrder() {
        this.showErrors.set(true);

        const billing = this.sameAsShipping() ? this.shippingAddress() : this.billingAddress();
        this.isCheckingOut.set(true);
        let paymentMethodId = null;

        try {
            // Stripe payment method creation
            if (this.selectedPaymentMethod() === 'Stripe') {
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
                    this.isCheckingOut.set(false);
                    return;
                }
            } else if (this.selectedPaymentMethod() === 'CreditCard') {
                if (!this.validateCard()) {
                    this.toastService.error('Please enter valid credit card details.');
                    this.isCheckingOut.set(false);
                    return;
                }
            }

            this.toastService.show('Processing your order...', 'info');
            const card = this.creditCard();

            const result = await this.cartService.checkout({
                currency: this.selectedCurrency(),
                country: this.selectedCountry(),
                idempotencyKey: `order-${Date.now()}`,
                shippingAddress: this.shippingAddress(),
                billingAddress: billing,
                paymentMethod: this.selectedPaymentMethod(),
                paymentMethodId: paymentMethodId,
                paymentDetails: this.selectedPaymentMethod() === 'CreditCard' ? {
                    cardName: card.name,
                    cardNumber: card.number,
                    expiry: card.expiry,
                    cvv: card.cvv
                } : null
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

                    if (this.selectedPaymentMethod() === 'Stripe' && checkoutData.actionData?.client_secret) {
                        this.toastService.show('Completing 3D Secure verification...', 'info');
                        try {
                            await this.stripeService.confirmCardPayment(checkoutData.actionData.client_secret);
                            // If it doesn't throw, it's successful (Stripe.js handles redirect/popups)
                            this.checkoutSuccess.set(checkoutData);
                            this.currentStep.set(4);
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
                this.checkoutSuccess.set(checkoutData);
                this.currentStep.set(4); // success step
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
            this.isCheckingOut.set(false);
        }
    }

    get shippingFee(): number { return 0; }
    get tax(): number { return 0; }
    get grandTotal(): number { return this.cartService.totalPrice() + this.shippingFee + this.tax; }

    scrollToItem(direction: 'next' | 'prev') {
        if (!this.itemsList) return;
        const el = this.itemsList.nativeElement;
        const scrollAmount = 300; // Roughly one card height or width
        if (direction === 'next') {
            el.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        } else {
            el.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
        }
    }

    trackById(index: number, item: any) {
        return item.id || index;
    }
}
