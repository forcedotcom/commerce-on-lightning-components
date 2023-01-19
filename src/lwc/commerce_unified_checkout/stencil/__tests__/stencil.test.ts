import { createElement } from 'lwc';
// @ts-ignore
import Stencil from 'commerce_unified_checkout/stencil';
import { StencilType } from 'commerce_unified_checkout/stencil';

const COUNT_DEFAULTS = {
    item: 5,
};

describe('Stencil', () => {
    let element: HTMLElement & Stencil;

    beforeEach(() => {
        element = createElement('commerce_unified_checkout-stencil', {
            is: Stencil,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('displays the correct number of default items', () => {
        // @ts-ignore
        const shippingAddressStencil = <HTMLElement>element?.querySelector('.stencil-container');
        const items = shippingAddressStencil.querySelectorAll('.stencil-item-container');
        expect(items).toHaveLength(COUNT_DEFAULTS.item);
    });

    it('api returns correct number of default items', () => {
        expect(element.itemCount).toBe(COUNT_DEFAULTS.item);
    });

    it('sets number of items correctly', async () => {
        // @ts-ignore
        const shippingAddressStencil = <HTMLElement>element.querySelector('.stencil-container');
        element.itemCount = 10;
        await Promise.resolve();
        const items = shippingAddressStencil.querySelectorAll('.stencil-item-container');
        expect(items).toHaveLength(10);
    });

    it('shows default stencil', async () => {
        await Promise.resolve();
        // @ts-ignore
        const templateShippingAddress = element.querySelector('[data-default-stencil]');
        expect(templateShippingAddress).toBeTruthy();
    });

    it('renders shipping address stencil', async () => {
        element.stencilType = StencilType.SHIPPING_ADDRESS;
        await Promise.resolve();
        // @ts-ignore
        const templateShippingAddressButton = element.querySelector('[data-shipping-address]');
        expect(templateShippingAddressButton).toBeTruthy();
    });

    it('renders shipping address visual picker stencil', async () => {
        element.stencilType = StencilType.SHIPPING_ADDRESS_PICKER;
        await Promise.resolve();
        // @ts-ignore
        const templateShippingAddressButton = element.querySelector('[data-shipping-address]');
        expect(templateShippingAddressButton).toBeTruthy();
    });

    it('renders shipping method stencil', async () => {
        element.stencilType = StencilType.SHIPPING_METHOD;
        await Promise.resolve();
        // @ts-ignore
        const templateShippingMethod = element.querySelector('[data-shipping-method]');
        expect(templateShippingMethod).toBeTruthy();
    });

    it('renders payment stencil', async () => {
        element.stencilType = StencilType.PAYMENT;
        await Promise.resolve();
        // @ts-ignore
        const templatePayment = element.querySelector('[data-payment]');
        expect(templatePayment).toBeTruthy();
    });
});
