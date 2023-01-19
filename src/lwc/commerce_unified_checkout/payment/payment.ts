import { api, LightningElement, track, wire } from 'lwc';

import Labels from './labels';
import { importComponent } from './importComponent';
import { authorizePayment, postAuthorizePayment } from 'commerce/checkoutApi';
import { InternalContextAdapter } from 'commerce/context';
import { PaymentAuthorizationError } from 'commerce_unified_checkout/paymentAuthorizationError';
import { getInstrumentation } from 'o11y/client';

import type CardPaymentMethod from '../cardPaymentMethod/cardPaymentMethod';
import type {
    PaymentCompleteResponse,
    Locator,
    Address,
    CustomPaymentComponent,
    PaymentAuthorizationResponse,
    PaymentClientSideCompleteResponse,
} from 'types/unified_checkout';
import type { ClientSidePaymentConfiguration, InternalContext } from 'commerce/context';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import type { SchematizedPayload } from 'o11y/dist/modules/o11y/client/interfaces';

const Locators = {
    NativeCardPaymentComponent: '[data-card-payment-method]',
    ClientSideComponent: '[data-client-side-payment]',
};

const paymentIntegrationNotLinked = (error: string): boolean => {
    return error.startsWith('No Payment Integration specified for webStore');
};

const COMPLETE_PAYMENT_ACTIVITY = 'ClientSideCompletePayment';

const CLIENT_SIDE_PAYMENT_SCHEMA = {
    namespace: 'sf.commerce',
    name: 'ClientSidePayment',
    pbjsSchema: {
        nested: {
            sf: {
                nested: {
                    commerce: {
                        nested: {
                            ClientSidePayment: {
                                options: { '(meta.msg.desc)': 'Client side payments instrumentation' },
                                fields: {
                                    resultCode: { options: {}, id: 2, type: 'string' },
                                    paymentMethod: { options: {}, id: 3, type: 'string' },
                                    componentName: { options: {}, id: 1, type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

export default class Payment extends LightningElement {
    public static renderMode = 'light';

    @api
    public webstoreId: string | undefined;

    @api
    public showComponentHeader = false;

    private _clientSidePaymentConfiguration: ClientSidePaymentConfiguration | undefined;

    @track
    private _paymentsConstructor: string | undefined;

    /**
     * Error related loading a custom component
     */
    private _paymentComponentError = false;

    private _paymentComponentErrorMessage: string | undefined;

    private readonly _instr = getInstrumentation('Client Side Payments');

    /**
     * Tokenize and authorize the payment for the given checkout's total cart amount
     *
     * @param checkoutId
     * @param address
     * @returns
     */
    @api
    public async completePayment(checkoutId: string, address: Address): Promise<PaymentCompleteResponse> {
        const billingAddress: Address = this.transformToPaymentAddress(address);
        return this.isNativePaymentComponent
            ? this.completePaymentNative(checkoutId, billingAddress)
            : this.completePaymentClientSide(checkoutId, billingAddress);
    }

    /**
     * Focus user input on the payment component
     */
    @api
    public focus(): void {
        this.queryComponent<CardPaymentMethod>(this.paymentComponentSelector).focus();
    }

    /**
     * Reports if the form is ready to be submitted for payment processing
     * If any fields are invalid or not completed this will return false
     *
     * @returns boolean Payment form is valid and ready to be submitted
     */
    @api public reportValidity(): boolean {
        return this.queryComponent<CustomPaymentComponent>(this.paymentComponentSelector).reportValidity();
    }

    @wire(InternalContextAdapter)
    private appContextHandler(response: StoreAdapterCallbackEntry<InternalContext>): void {
        if (response.error) {
            // If there is an application context error we don't know if it's server side or client side
            this._paymentComponentError = true;
            this._paymentComponentErrorMessage = this.labels.unknownError;
        } else if (response.data && response.data.clientSidePaymentConfiguration) {
            // Reset error state in case this is not the first value streamed
            this._paymentComponentError = false;
            this._clientSidePaymentConfiguration = response.data.clientSidePaymentConfiguration;
            this.loadCustomComponent();
        } else {
            // Reset error state and client side config in case this isn't the first value streamed
            this._paymentComponentError = false;
            this._clientSidePaymentConfiguration = undefined;
        }
    }

    private completePaymentNative(checkoutId: string, billingAddress: Address): Promise<PaymentAuthorizationResponse> {
        if (!this.webstoreId) {
            return Promise.reject('webstore id is required to complete a payment');
        }

        return this.queryComponent<CardPaymentMethod>(Locators.NativeCardPaymentComponent)
            .tokenizePaymentMethod(this.webstoreId, billingAddress)
            .then((tokenResponse) => {
                return authorizePayment(checkoutId, tokenResponse.token, billingAddress);
            })
            .catch((authResponse: PaymentCompleteResponse) => {
                const error = authResponse.errors?.[0];
                throw new PaymentAuthorizationError(error);
            });
    }

    private async completePaymentClientSide(
        checkoutId: string,
        billingAddress: Address
    ): Promise<PaymentAuthorizationResponse> {
        const stopAndErrorData: SchematizedPayload = {
            schema: CLIENT_SIDE_PAYMENT_SCHEMA,
            payload: {
                componentName: this._clientSidePaymentConfiguration?.componentName,
                paymentMethod: 'CardPayment',
            },
        };

        const paymentResponse: PaymentClientSideCompleteResponse = await this._instr.activityAsync(
            COMPLETE_PAYMENT_ACTIVITY,
            () => {
                return this.queryComponent<CustomPaymentComponent>(Locators.ClientSideComponent)
                    .completePayment(billingAddress)
                    .then(({ error, responseCode, logs }) => {
                        Object.assign(stopAndErrorData, {
                            resultCode: responseCode,
                        });

                        if (error || !responseCode) {
                            const errorMessage = error
                                ? error.message
                                : 'no response code received from custom component';
                            const checkoutError: PaymentAuthorizationError = new PaymentAuthorizationError({
                                type: '/commerce/errors/payment-failure',
                                title: errorMessage,
                                detail: errorMessage,
                                instance: 'client',
                            });

                            return Promise.reject(checkoutError);
                        }

                        return { error, responseCode, logs };
                    });
            },
            {
                errorPayload: stopAndErrorData,
                stopPayload: stopAndErrorData,
            }
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return postAuthorizePayment(checkoutId, paymentResponse.responseCode!, billingAddress);
    }

    private get paymentComponentSelector(): string {
        return this.isNativePaymentComponent ? Locators.NativeCardPaymentComponent : Locators.ClientSideComponent;
    }

    private get paymentComponentName(): string | undefined {
        return this._clientSidePaymentConfiguration?.componentName;
    }

    private get clientSideConfig(): Record<string, string> | undefined {
        return this._clientSidePaymentConfiguration?.config;
    }

    private async loadCustomComponent(): Promise<void> {
        if (this._clientSidePaymentConfiguration?.error) {
            this._paymentComponentErrorMessage = paymentIntegrationNotLinked(
                this._clientSidePaymentConfiguration?.error
            )
                ? this._clientSidePaymentConfiguration?.error
                : this.labels.unknownError;
            this._paymentComponentError = true;
            console.error('Error loading component: ' + this._clientSidePaymentConfiguration?.error);
        } else {
            await this.loadPaymentsConstructor();
            await this.initializeCustomComponent();
        }
    }

    private initializeCustomComponent(): Promise<void> {
        if (!this._paymentComponentError) {
            return this.queryComponent<CustomPaymentComponent>(Locators.ClientSideComponent).initialize(
                this.clientSideConfig,
                this.webstoreId
            );
        }

        return Promise.resolve();
    }

    private async loadPaymentsConstructor(): Promise<void> {
        try {
            if (this.paymentComponentName) {
                this._paymentsConstructor = await importComponent(this.paymentComponentName);
                return;
            }

            // This should never happen
            await Promise.reject('In client side mode but no payment component provided.');
        } catch (e: unknown) {
            this._paymentComponentErrorMessage = this.labels.unknownError;
            this._paymentComponentError = true;
            console.error('Error loading payment component:' + e);
        }
    }

    private transformToPaymentAddress(address: Address): Address {
        const result = {
            city: address.city,
            country: address.country,
            name: address.name,
            postalCode: address.postalCode,
            region: address.region,
            street: address.street,
        };
        return result;
    }

    private queryComponent<T extends HTMLElement | LightningElement>(locator: Locator): T {
        return <T>(<unknown>this.querySelector(locator));
    }

    private get isCustomPaymentComponent(): boolean {
        return !!this._clientSidePaymentConfiguration;
    }

    private get isNativePaymentComponent(): boolean {
        return !this.isCustomPaymentComponent;
    }

    private get labels(): Record<string, string> {
        return Labels;
    }
}
