import { createElement } from 'lwc';
import Footer from 'commerce_cart/footer';

const CLEAR_CART_EVENT = 'cartclear';

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(),
    }),
    { virtual: true }
);

describe('Cart Footer', () => {
    let element: HTMLElement & Footer;

    beforeEach(() => {
        element = createElement('commerce_cart-footer', {
            is: Footer,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    it('should show the "Clear cart" dialog when clicked', async () => {
        let dialogContents = element.querySelector('lightning-dialog *');

        expect(dialogContents).toBeNull();

        const clearCartButton = element.querySelector('.clear-cart-button');
        clearCartButton?.dispatchEvent(new CustomEvent('click'));

        await Promise.resolve();

        dialogContents = element.querySelector('lightning-dialog *');

        expect(dialogContents).not.toBeNull();
    });

    it('should fire the "cartclear" event when the confirm clear cart button is click', async () => {
        const eventHandler = jest.fn();
        element.addEventListener(CLEAR_CART_EVENT, eventHandler);

        const clearCartButton = element.querySelector('.clear-cart-button');
        clearCartButton?.dispatchEvent(new CustomEvent('click'));

        await Promise.resolve();

        const confirmButton = element.querySelector('lightning-dialog .slds-button_brand');

        confirmButton?.dispatchEvent(new CustomEvent('click'));

        expect(eventHandler).toHaveBeenCalledTimes(1);
    });

    it('should close the clear cart dialog when the confirm clear cart button is clicked', async () => {
        const clearCartButton = element.querySelector('.clear-cart-button');
        clearCartButton?.dispatchEvent(new CustomEvent('click'));

        await Promise.resolve();

        const confirmButton = element.querySelector('lightning-dialog .slds-button_brand');

        confirmButton?.dispatchEvent(new CustomEvent('click'));

        await Promise.resolve();

        const dialogContents = element.querySelector('lightning-dialog *');

        expect(dialogContents).toBeNull();
    });

    it('should NOT fire the "cartclear" event when the Cancel button is clicked', async () => {
        const eventHandler = jest.fn();
        element.addEventListener(CLEAR_CART_EVENT, eventHandler);

        const clearCartButton = element.querySelector('.clear-cart-button');
        clearCartButton?.dispatchEvent(new CustomEvent('click'));

        await Promise.resolve();

        const confirmButton = element.querySelector('lightning-dialog .slds-button_neutral');

        confirmButton?.dispatchEvent(new CustomEvent('click'));

        expect(eventHandler).not.toHaveBeenCalled();
    });

    it('should close the dialog when the Cancel button is clicked', async () => {
        const clearCartButton = element.querySelector('.clear-cart-button');
        clearCartButton?.dispatchEvent(new CustomEvent('click'));

        await Promise.resolve();

        const confirmButton = element.querySelector('lightning-dialog .slds-button_neutral');

        confirmButton?.dispatchEvent(new CustomEvent('click'));

        await Promise.resolve();

        const dialogContents = element.querySelector('lightning-dialog *');

        expect(dialogContents).toBeNull();
    });
});
