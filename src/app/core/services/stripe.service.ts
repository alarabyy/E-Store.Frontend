import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StripeService {
    private stripePromise: Promise<Stripe | null> | null = null;
    private elements: StripeElements | null = null;
    private cardElement: StripeCardElement | null = null;

    async initialize(publicKey: string): Promise<void> {
        if (!this.stripePromise) {
            this.stripePromise = loadStripe(publicKey);
        }
    }

    async getStripe(): Promise<Stripe | null> {
        return this.stripePromise;
    }

    async initializeElements(containerId: string): Promise<void> {
        const stripe = await this.getStripe();
        if (!stripe) return;

        this.elements = stripe.elements();
        this.cardElement = this.elements.create('card', {
            style: {
                base: {
                    color: '#1e293b',
                    fontFamily: '"Outfit", sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                        color: '#94a3b8'
                    }
                },
                invalid: {
                    color: '#ef4444',
                    iconColor: '#ef4444'
                }
            }
        });

        this.cardElement.mount(`#${containerId}`);
    }

    async createPaymentMethod(billingDetails: any): Promise<any> {
        const stripe = await this.getStripe();
        if (!stripe || !this.cardElement) return null;

        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: this.cardElement,
            billing_details: billingDetails
        });

        if (error) {
            throw error;
        }

        return paymentMethod;
    }

    async confirmCardPayment(clientSecret: string): Promise<any> {
        const stripe = await this.getStripe();
        if (!stripe || !this.cardElement) return null;

        const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: this.cardElement
            }
        });

        if (error) {
            throw error;
        }

        return paymentIntent;
    }

    destroyElements(): void {
        if (this.cardElement) {
            this.cardElement.unmount();
            this.cardElement.destroy();
            this.cardElement = null;
        }
    }
}
