import { createElement } from 'lwc';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
// @ts-ignore
import OrderConfirmation from 'commerce_unified_checkout/orderConfirmation';
import { NavigationContext, CurrentPageReference, navigate } from 'lightning/navigation';

const homePageRef = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Home',
    },
};

const mockCurrentPageReference = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Order',
    },
    state: {
        orderNumber: 'orderNumber123',
    },
};

jest.mock('lightning/navigation', () => ({
    NavigationContext: mockCreateTestWireAdapter(jest.fn()),
    CurrentPageReference: mockCreateTestWireAdapter(jest.fn()),
    generateUrl: jest.fn(() => '/home'),
    navigate: jest.fn(),
}));

describe('commerce_unified_checkout/orderConfirmation api', () => {
    let element: HTMLElement & OrderConfirmation;

    beforeEach(() => {
        element = createElement('commerce_unified_checkout-order-confirmation', {
            is: OrderConfirmation,
        });

        element.headerText = 'Header Text';
        element.confirmationNumberText = 'Confirmation Number Text';
        element.bodyText = 'Body Text';
        element.buttonText = 'Button Text';

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('shows default texts', () => {
        expect((<HTMLElement>element.querySelector('.slds-text-heading_large')).textContent).toBe('Header Text');
        expect((<HTMLElement>element.querySelector('[data-automation=order-confirmation-number]')).textContent).toBe(
            'Confirmation Number Text: '
        );
        expect((<HTMLElement>element.querySelector('.slds-p-vertical_small')).textContent).toBe('Body Text');
        expect((<HTMLElement>element.querySelector('[data-automation=continue-shopping-button]')).textContent).toBe(
            'Button Text'
        );
    });

    it('should update the text from api', async () => {
        element.headerText = 'Header Text updated';
        element.confirmationNumberText = 'Confirmation Number Text updated';
        element.bodyText = 'Body Text updated';
        element.buttonText = 'Button Text updated';
        await Promise.resolve();
        expect((<HTMLElement>element.querySelector('.slds-text-heading_large')).textContent).toBe(
            'Header Text updated'
        );
        expect((<HTMLElement>element.querySelector('[data-automation=order-confirmation-number]')).textContent).toBe(
            'Confirmation Number Text updated: '
        );
        expect((<HTMLElement>element.querySelector('.slds-p-vertical_small')).textContent).toBe('Body Text updated');
        expect((<HTMLElement>element.querySelector('[data-automation=continue-shopping-button]')).textContent).toBe(
            'Button Text updated'
        );
    });

    it('should set the href attribute of the anchor continue shopping', async () => {
        // @ts-ignore
        NavigationContext.emit('mockNavigationContext');
        await Promise.resolve(); // async wire NavigationContext
        const continueShippingButton = <HTMLLinkElement>element.querySelector('.my-brand');
        const link = continueShippingButton.getAttribute('href');
        expect(link).toBe('/home');
    });

    it('should navigate to home page upon clicking Continue Shopping button', async () => {
        const continueShoppingBtn = <HTMLLinkElement>element.querySelector('.slds-button');

        continueShoppingBtn.click();
        await Promise.resolve();

        expect(navigate).toHaveBeenCalledWith(undefined, homePageRef);
    });

    it('gets order number from CurrentPageReference', async () => {
        // @ts-ignore
        CurrentPageReference.emit(mockCurrentPageReference);
        await Promise.resolve();
        expect((<HTMLElement>element.querySelector('[data-automation=order-confirmation-number]')).textContent).toBe(
            'Confirmation Number Text: orderNumber123'
        );
    });
});
