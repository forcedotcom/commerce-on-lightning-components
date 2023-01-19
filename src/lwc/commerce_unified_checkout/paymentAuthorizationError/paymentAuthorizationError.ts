import type { CheckoutRequestError } from 'types/unified_checkout';

export class PaymentAuthorizationError {
    constructor(private paymentError: CheckoutRequestError | undefined) {}
}
