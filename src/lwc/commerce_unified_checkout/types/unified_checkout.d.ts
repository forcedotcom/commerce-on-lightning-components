import type { LightningElement } from 'lwc';
import type { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';
import type { CheckoutStatus } from 'commerce_unified_checkout/checkoutApiInternal';

/**
 * Used to locate dom elements
 * @type {string}
 */
export type Locator = string;

/**
 * Generic api error from platform
 */
export type PlatformError = {
    errorCode: string;
    message: string;
};

/**
 * Used to identify a checkout step.
 */
export type CheckoutStepIdentifier = {
    /**
     * The unique key which represents the checkout step.
     * @type {string}
     */
    checkoutStepKey: string;
};

/**
 * An entry in checkout of property stepsConfig array which defines one step/section of the checkout layout.
 * Most commonly a CheckoutStepConfig entry for shipping address, delivery method and payment are created.
 */
export interface CheckoutStepConfig extends CheckoutStepIdentifier {
    /**
     * The user created exposed name of the step rendered in the UI.
     * @type {string}
     */
    checkoutStepName: string;

    /**
     * Property to control whether the step is expanded or collapsed in the UI.
     * @type {boolean}
     */
    isExpanded: boolean;

    /**
     * The child components to be rendered in this step.
     * An example would be the shipping address component for the shipping address step.
     * @type {string[]}
     */
    seedComponents: string[];
}

/**
 * A CheckoutSavable interface is to be implemented on child components of the main checkout step components.
 * Most commonly Shipping address, delivery method and payment components implement this interface.
 */
export interface CheckoutSavable extends LightningElement {
    /**
     * This method is invoked on a checkout child component directly from the parent checkout or step component.
     * The method is most likely to trigger an API request to save the user input of the child component.
     *
     * @returns Promise<void>
     */
    checkoutSave?(): Promise<void>;

    /**
     * This method is used to render the appropriate view based on the mode.
     * This property is usually set from the parent checkout/step component or internally from an API response.
     *
     * @type {CheckoutMode}
     */
    checkoutMode: CheckoutMode;

    /**
     * Is true when all input is valid
     * @type {boolean}
     */
    checkValidity?: boolean;

    /**
     * Is true when all input is valid report form error messages otherwise
     * @type {boolean}
     */
    reportValidity?(): boolean;

    /**
     * Used in the payment component for checkout one-page layout.
     * Usually calls the payment component checkoutSave() method just as checkout accordion layout does.
     * @type Promise<void>
     */
    placeOrder?(): Promise<void>;

    /**
     * Should focus the component with a focusable element.
     * (Currently evaluating and for internally use. Skip customer documentation on this property)
     * @type {boolean}
     */
    shouldSetFocus?: boolean;
}

/**
 * A Step component interface extended from CheckoutSavable.
 * The step component typically uses the composite pattern to set properties and invoke methods on its children.
 */
export interface CheckoutStep extends CheckoutSavable {
    /**
     * This method invokes checkoutSave on child components directly.
     * The method is most likely to trigger an API request to save the user input of the child component.
     *
     * @returns Promise<void>
     */
    checkoutSave(): Promise<void>;

    /**
     * A property used for checkout one-page or accordion layout.
     * Checkout steps behave a little differently in one-page layout vs accordion layout. Some differences are:
     *  - Individual steps are expanded in one-page layout
     *  - Step Proceed buttons are hidden only one place order button is shown on checkout.
     *  - Each step is typically in edit checkout mode rather than future or readonly.
     * @type {boolean}
     */
    isOnePageLayout: boolean;

    /**
     * Used in the checkout one-page layout to ensure the steps' child components report as valid.
     * Used in the checkout one-page place order handler to ensure steps are ready to save.
     * @param reportValidity report form errors or silently check validity
     * @type Promise<void>
     */
    isReadyToSave(reportValidity?: boolean): boolean;

    /**
     * Used in the payment component for checkout one-page layout.
     * Usually calls the payment component checkoutSave() method just as checkout accordion layout does.
     * @type Promise<void>
     */
    placeOrder(): void;
}

/**
 * A shipping or billing address for checkout.
 */
export type Address = {
    name?: string;
    firstName?: string;
    lastName?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    region?: string;
    country?: string; // this is actually a country code
    addressId?: string; // when using CPA API
    id?: string; // when using checkouts deliveryGroup API
    fields?: unknown; // returned in responses but otherwise not desired
    geocodeAccuracy?: string;
    isDefault?: boolean;
    addressType?: string;
    label?: string;
};

/**
 * Used for personal identification (pii) such as from a guest user.
 */
export type ContactInfo = {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
};

/**
 * An address request used for contact point addresses.
 */
export type AddressesRequest = {
    addressType?: string;
    defaultOnly?: boolean;
    pageSize?: number;
    sortOrder?: string;
    excludeUnsupportedCountries?: boolean;
};

/**
 * A single delivery method from the checkout api.
 */
export type DeliveryMethod = {
    name: string;
    carrier: string;
    classOfService: string;
    currencyIsoCode: string;
    id: string;
    shippingFee: string;
};

/**
 * Delivery method items from the checkout api.
 */
export type DeliveryMethods = {
    items: DeliveryMethod[];
};

/**
 * A single delivery group from the checkout api.
 */
export type DeliveryGroup = {
    deliveryAddress?: Address;
    id?: string;
    desiredDeliveryDate?: string;
    shippingInstructions?: string;
    selectedDeliveryMethod?: DeliveryMethod;
    availableDeliveryMethods?: DeliveryMethod[];
};

/**
 * Delivery group items from the checkout api.
 */
export type DeliveryGroups = {
    items: DeliveryGroup[];
};

/**
 * Used to hold the current state of checkout from the checkout api.
 */
export type CheckoutInformation = {
    /**
     * exposed HTTP status code from most recently polled checkout API.
     * undefined implies checkout API status is unknown either
     * because it has never loaded, or because it has been imperatively
     * cleared in preparation for an update checkout state call.
     *
     * @type {CheckoutStatus}
     */
    checkoutStatus?: CheckoutStatus;

    /**
     * Unique ID for the current checkout session
     * Returned from GET 'active' checkout or POST checkout
     */
    checkoutId?: string;

    /**
     * captured delivery address and delivery method for the buyer
     */
    deliveryGroups?: DeliveryGroups;

    /**
     * captured guest buyer contact information
     */
    contactInfo?: ContactInfo;

    /**
     * Details any recoverable errors that must be fixed by the buyer
     */
    errors?: CheckoutRequestError[];
};

export type ShippingFailure = '/commerce/errors/shipping-failure';
export type PaymentFailure = '/commerce/errors/payment-failure';
export type CheckoutFailure = '/commerce/errors/checkout-failure';
export type RequestErrorType = ShippingFailure | PaymentFailure | CheckoutFailure;
export type CheckoutRequestError = {
    // Add more error types here as a union
    type: RequestErrorType;
    title: string;
    detail: string;
    instance: string;
};

export type OrderConfirmation = {
    orderReferenceNumber?: string;
    errors?: CheckoutRequestError[];
};

export type ContactPointAddressData = {
    count: number;
    currentPageUrl: string;
    items: Address[];
    nextPageToken: string;
    nextPageUrl: string;
    sortOrder: string;
};

export type PaymentRequestType = 'Auth' | 'PostAuth' | 'SimplePurchaseOrder' | 'ClientRequest';

export type CheckoutPaymentRequestBody = {
    paymentToken?: string;
    requestType: PaymentRequestType;
    billingAddress?: Address;
    paymentsData?: string;
};

export type SalesforceResultCode =
    | 'Success'
    | 'RequiresReview'
    | 'PermanentFail'
    | 'Decline'
    | 'Indeterminate'
    | 'SystemError'
    | 'ValidationError';

export type PaymentAuthorizationResponse = {
    salesforceResultCode: SalesforceResultCode;
    errors?: CheckoutRequestError[];
};

export type PaymentCompleteResponse = PaymentAuthorizationResponse;

export type PaymentClientRequestResponse = {
    errors?: CheckoutRequestError[];
    paymentsData?: PaymentsData;
};

export type PaymentsData = Record<string, PaymentsDataValue>;

export type PaymentsDataValue = string | number | boolean | PaymentsData;

export type PaymentTokenizeRequestContext = {
    webstoreId: string;
    apiVersion: string;
    csrfToken: string;
    billingAddress: Address;
};

type BrandingVariableMap = { [cssVariable: string]: string };
type BrandingVariableTuple = [string, string];

export type CardPaymentMethodApi = {
    fillWithTestCardData(testCardType: string): void;
    reportValidity(): boolean;
    focus(): void;
    tokenizePaymentMethod(webStoreId: string, billingAddress: Address): Promise<PaymentTokenizeResponse>;
};

export interface CardPaymentMethodIframeApi extends Element {
    fillWithTestCardData(testCardType: string): void;
    reportValidity(): boolean;
    focus(): void;
    tokenizePaymentMethod(requestContext: PaymentTokenizeRequestContext): Promise<PaymentTokenizeResponse>;
}

export interface CustomPaymentComponent extends LightningElement {
    initialize(config?: Record<string, string>, webStoreId?: string): Promise<void>;
    completePayment(address: Address): Promise<PaymentClientSideCompleteResponse>;
    focus(): void;
    reportValidity: () => boolean;
}

export type PaymentGatewayLog = {
    authorizationCode?: string;
    refNumber?: string;
    description?: string;
    interactionType: 'Tokenize' | 'Authorization';
    interactionStatus: 'Success' | 'Failed' | 'NoOp' | 'Initiated' | 'Timeout';
    gatewayDate?: string;
    response: Record<unknown, unknown>;
    request: Record<unknown, unknown>;
};

export type PaymentClientSideCompleteResponse = {
    responseCode?: string;
    error?: {
        message: string;
        code: string;
    };
    logs: PaymentGatewayLog[];
};

export type PaymentTokenizeResponse = {
    token: string;
};
export type ErrorLabels = {
    body: string | undefined;
    header: string | undefined;
};

export type ExceptionWithError = {
    error: unknown;
};
