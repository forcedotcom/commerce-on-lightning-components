export interface StripeElement {
    mount: () => void;
    destroy: () => void;
    on: () => void;
    update: () => void;
}

export interface StripeElements {
    create: jest.Mock<StripeElement, [type: string]>;
    getElement: jest.Mock<StripeElement, [type: string]>;
    update: () => void;
}

export interface StripeJS {
    elements: jest.Mock;
    createToken: jest.Mock;
    createSource: jest.Mock;
    createPaymentMethod: jest.Mock;
    confirmCardPayment: jest.Mock;
    confirmCardSetup: jest.Mock;
    paymentRequest: jest.Mock;
    registerAppInfo: jest.Mock;
    _registerWrapper: jest.Mock;
}

export const mockElement: () => StripeElement = () => ({
    mount: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    update: jest.fn(),
});

export const mockElements: () => StripeElements = () => {
    const elements: Record<string, StripeElement> = {};
    return {
        create: jest.fn((type: string) => {
            elements[type] = mockElement();
            return elements[type];
        }),
        getElement: jest.fn((type) => {
            return elements[type] || null;
        }),
        update: jest.fn(),
    } as StripeElements;
};

export const mockStripe = jest.fn().mockReturnValue({
    elements: jest.fn(() => mockElements()),
    createToken: jest.fn(),
    createSource: jest.fn(),
    createPaymentMethod: jest.fn(),
    confirmCardPayment: jest.fn(),
    confirmCardSetup: jest.fn(),
    paymentRequest: jest.fn(),
    registerAppInfo: jest.fn(),
    _registerWrapper: jest.fn(),
});

export function setupMockStripeJs(): void {
    // @ts-ignore
    global.Stripe = mockStripe;
}

export function tearDownMockStripeJs(): void {
    // @ts-ignore
    delete global.Stripe;
}
