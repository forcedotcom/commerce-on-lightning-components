import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
// @ts-ignore
import ShippingInstructions from 'commerce_unified_checkout/shippingInstructions';
import { CheckoutMode } from '../../checkoutMode/checkoutMode';
import { CheckoutInformationAdapter, notifyAndPollCheckout, updateShippingAddress } from 'commerce/checkoutApi';
import type { CheckoutInformation } from 'types/unified_checkout';
import { SessionContextAdapter } from 'commerce/contextApi';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('commerce/checkoutApi', () => {
    return Object.assign({}, jest.requireActual('commerce/checkoutApi'), {
        notifyAndPollCheckout: jest.fn().mockImplementation(() => {
            return Promise.resolve();
        }),
        updateShippingAddress: jest.fn(),
        CheckoutInformationAdapter: mockCreateTestWireAdapter(),
    });
});

jest.mock('commerce/contextApi', () => ({
    SessionContextAdapter: mockCreateTestWireAdapter(),
}));

// Create a new variable and type it as jest.Mock passing the type
// https://klzns.github.io/how-to-use-type-script-and-jest-mocks
const mockedUpdateShippingAddress = updateShippingAddress as jest.Mock<Promise<CheckoutInformation>>;

const generatedErrorLabel = {
    header: 'ERROR-HEADER',
    body: 'ERROR-BODY',
};

jest.mock('commerce_unified_checkout/errorHandler', () => {
    return Object.assign({}, jest.requireActual('commerce_unified_checkout/errorHandler'), {
        generateErrorLabel: jest.fn(() => generatedErrorLabel),
    });
});

const SHIPPING_INSTRUCTIONS = 'SOME INSTRUCTIONS';

describe('Shipping Instructions component', () => {
    let element: HTMLElement & ShippingInstructions;

    beforeEach(async () => {
        element = createElement('commerce_unified_checkout-shipping-instructions', {
            is: ShippingInstructions,
        });

        element.headerLabel = 'Shipping Instructions';
        element.placeholderLabel = 'Cross street, security code...';

        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                deliveryGroups: {
                    items: [{ shippingInstructions: SHIPPING_INSTRUCTIONS }],
                },
            },
            loaded: true,
        });
        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    describe('component', () => {
        it('should not show the componment when set showComp to false', async () => {
            element.showComp = false;

            await Promise.resolve();
            // @ts-ignore
            const inputElement = element.querySelector('lightning-input');
            expect(element.showComp).toBeFalsy();
            expect(inputElement).toBeFalsy();
        });
    });

    describe('getting and setting', () => {
        it('should let you get and set the visibility of the header label', () => {
            // Test default
            expect(element.showHeaderLabel).toBe(true);

            // Test setter
            element.showHeaderLabel = false;
            expect(element.showHeaderLabel).toBe(false);
        });

        it('should let you get get the value of the text input', async () => {
            const testInstructions = 'Do something bad...';

            // Test default
            expect(element.instructions).toEqual(SHIPPING_INSTRUCTIONS);

            // Test setter
            element.instructions = testInstructions;

            await Promise.resolve();
            // @ts-ignore
            const instructionsHTMLValue = element.querySelector('lightning-input').value;
            expect(element.instructions).toEqual(instructionsHTMLValue);
        });
    });

    describe('event', () => {
        it('should dispatch "dataready" event when shipping instruction changes', async () => {
            let dispatched = false;
            element.addEventListener('dataready', () => {
                dispatched = true;
            });

            await Promise.resolve();
            const inputElement = element.querySelector('lightning-input');
            inputElement.value = SHIPPING_INSTRUCTIONS;
            inputElement.dispatchEvent(new CustomEvent('commit'));
            expect(dispatched).toBe(true);
        });
    });

    describe('labels', () => {
        it('should render the default labels in Edit mode', async () => {
            element.showComp = true;
            element.readOnly = false;

            // @ts-ignore
            const header = element.querySelector('h3');
            // @ts-ignore
            const placeholder = element.querySelector('lightning-input');

            await Promise.resolve();
            expect(header.textContent).toBe('Shipping Instructions');
            expect(placeholder.placeholder).toBe('Cross street, security code...');
        });
    });

    describe('Readonly mode', () => {
        it('should display the default template under default conditions', async () => {
            await Promise.resolve();
            // @ts-ignore
            const templateEdit = element.querySelector('[data-shipping-instructions-edit]');
            expect(templateEdit).toBeTruthy();
        });

        it('should display the readonly template under readonly conditions', async () => {
            element.readOnly = true;
            await Promise.resolve();
            // @ts-ignore
            const templateReadonly = element.querySelector('[data-shipping-instructions-readonly]');
            expect(templateReadonly.children.length).toBeGreaterThan(0);
        });
        it('should not show the componment when set showComp to false', async () => {
            element.showComp = false;
            element.readOnly = true;

            await Promise.resolve();
            // @ts-ignore
            const templateReadonly = element.querySelector('[data-shipping-instructions-readonly]');
            expect(templateReadonly.children).toHaveLength(0);
        });
    });

    describe('checkoutmode', () => {
        it('should set all checkout modes correctly', () => {
            [CheckoutMode.DISABLED, CheckoutMode.EDIT, CheckoutMode.SUMMARY, CheckoutMode.DISABLED].forEach((mode) => {
                element.checkoutMode = mode;
                expect(element.checkoutMode).toEqual(mode);
            });
        });
        it('should set readonly when checkout mode is readonly to true', () => {
            element.checkoutMode = CheckoutMode.SUMMARY;
            expect(element.checkoutMode).toEqual(CheckoutMode.SUMMARY);
            expect(element.readOnly).toBe(true);
        });
        it('should set readonly when checkout mode isnt readonly to false', () => {
            element.checkoutMode = CheckoutMode.EDIT;
            expect(element.checkoutMode).toEqual(CheckoutMode.EDIT);
            expect(element.readOnly).toBe(false);
        });
    });

    describe('checkoutSave', () => {
        const newInstructions = 'new instructions';

        beforeEach(() => {
            const inputElement = element.querySelector('lightning-input');
            inputElement.value = newInstructions;
            inputElement.dispatchEvent(new CustomEvent('commit'));
        });
        it('should handle shipping instructions changes', async () => {
            await Promise.resolve();

            expect(element.instructions).toEqual(newInstructions);
        });

        it('should save shipping instructions changes', async () => {
            await element.checkoutSave();

            expect(updateShippingAddress).toHaveBeenCalledTimes(1);
            expect(notifyAndPollCheckout).toHaveBeenCalledTimes(1);
        });

        it('should not save same shipping instructions', async () => {
            const inputElement = element.querySelector('lightning-input');
            inputElement.value = SHIPPING_INSTRUCTIONS;
            inputElement.dispatchEvent(new CustomEvent('commit'));

            await element.checkoutSave();

            expect(updateShippingAddress).toHaveBeenCalledTimes(0);
        });

        it('should show error and not proceed when update shipping address API throws an error', async () => {
            const error = new Error('test error');
            mockedUpdateShippingAddress.mockImplementation(() => {
                // see https://developer.mozilla.org/en-US/docs/Web/API/Response
                return Promise.reject(error);
            });
            expect.assertions(7);
            await Promise.resolve();
            expect(element.isError).toBeFalsy();
            await expect(element.checkoutSave()).rejects.toEqual(error);
            expect(updateShippingAddress).toHaveBeenCalledTimes(1);
            expect(notifyAndPollCheckout).toHaveBeenCalledTimes(0);
            expect(element.isError).toBeTruthy();
            const notificationContent = element.querySelector('b2c_lite_commerce-scoped-notification');
            expect(notificationContent.textContent).toContain(generatedErrorLabel.header);
            expect(notificationContent.textContent).toContain(generatedErrorLabel.body);
        });
    });
});

describe('Shipping Instructions component checkoutAdapterHandler', () => {
    let element: HTMLElement & ShippingInstructions;

    beforeEach(async () => {
        element = createElement('commerce_unified_checkout-shipping-instructions', {
            is: ShippingInstructions,
        });

        element.headerLabel = 'Shipping Instructions';
        element.placeholderLabel = 'Cross street, security code...';

        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    it('should load shippingInstructions once', async () => {
        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                deliveryGroups: {
                    items: [{ shippingInstructions: SHIPPING_INSTRUCTIONS }],
                },
            },
            loaded: true,
        });

        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                deliveryGroups: {
                    items: [{ shippingInstructions: 'instructions two' }],
                },
            },
            loaded: true,
        });
        await Promise.resolve();
        expect(element.instructions).toEqual(SHIPPING_INSTRUCTIONS);
    });

    it('should default to empty shippingInstructions', async () => {
        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                deliveryGroups: {
                    items: [{}],
                },
            },
            loaded: true,
        });
        await Promise.resolve();
        expect(element.instructions).toBe('');
    });

    it('should not save if existing and new shipping instructions are empty', async () => {
        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                deliveryGroups: {
                    items: [{}],
                },
            },
            loaded: true,
        });
        await Promise.resolve();
        const inputElement = element.querySelector('lightning-input');
        inputElement.value = '';
        inputElement.dispatchEvent(new CustomEvent('commit'));

        await element.checkoutSave();

        expect(updateShippingAddress).toHaveBeenCalledTimes(0);
    });

    it('should not update for builder mode', async () => {
        (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
            data: {
                isPreview: true,
            },
        });

        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                deliveryGroups: {
                    items: [{ shippingInstructions: SHIPPING_INSTRUCTIONS }],
                },
            },
            loaded: true,
        });

        await Promise.resolve();
        expect(element.instructions).toBe('');
    });
});
