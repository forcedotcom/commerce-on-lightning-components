import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import Items from 'commerce_cart/items';
import { SHOW_MORE_EVENT } from '../constants';
import { sampleCartItemData } from './data/cartItemData';

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(),
    }),
    { virtual: true }
);

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => Promise.resolve('test_product_url')),
    NavigationContext: mockCreateTestWireAdapter(),
}));

describe('Cart Items', () => {
    let element: HTMLElement & Items;

    beforeEach(() => {
        jest.clearAllMocks();
        console.warn = jest.fn();

        element = createElement('commerce_cart-items', {
            is: Items,
        });

        element.items = sampleCartItemData;
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('displays the "show more" button when displayShowMore is true', async () => {
        element.displayShowMore = true;

        await Promise.resolve();

        const showMoreButton = element.querySelector('.show-more-button');
        expect(showMoreButton).not.toBeNull();
    });

    it('does not display the "show more" button when displayShowMore is not set', () => {
        const showMoreButton = element.querySelector('.show-more-button');
        expect(showMoreButton).toBeNull();
    });

    it('does not display the "show more" button when displayShowMore false', async () => {
        element.displayShowMore = false;

        await Promise.resolve();

        const showMoreButton = element.querySelector('.show-more-button');
        expect(showMoreButton).toBeNull();
    });

    it('fires the "cartshowmore" event when the button is clicked', async () => {
        const eventHandler = jest.fn();
        element.addEventListener(SHOW_MORE_EVENT, eventHandler);

        element.displayShowMore = true;

        await Promise.resolve();

        const showMoreButton = element.querySelector('.show-more-button');

        showMoreButton?.dispatchEvent(new CustomEvent('click'));

        expect(eventHandler).toHaveBeenCalledTimes(1);
    });

    describe('custom styles', () => {
        it('generates the styles that are set: pricePerUnitFontColor', async () => {
            element.pricePerUnitFontColor = '#444444';

            await Promise.resolve();

            const cartItems = <HTMLElement[]>Array.from(element.querySelectorAll('commerce_cart-item'));
            expect(cartItems[0].style.cssText).toContain('--com-c-cart-item-unit-price-font-color: #444444');
        });

        it('generates the styles that are set: promotionsAppliedSavingsButtonBorderRadius', async () => {
            element.promotionsAppliedSavingsButtonBorderRadius = '20';

            await Promise.resolve();

            const cartItems = <HTMLElement[]>Array.from(element.querySelectorAll('commerce_cart-item'));
            expect(cartItems[0].style.cssText).toContain(
                '--com-c-cart-item-applied-savings-button-border-radius: 20px'
            );
        });

        it('does NOT generate the styles that are not set: pricePerUnitFontColor', async () => {
            element.originalPriceFontColor = '#444444';

            await Promise.resolve();

            const cartItems = <HTMLElement[]>Array.from(element.querySelectorAll('commerce_cart-item'));
            expect(cartItems[0].style.cssText).not.toContain('--com-c-cart-item-unit-price-font-color: #444444');
        });

        it('does NOT generate the styles that are not set: promotionsAppliedSavingsButtonBorderRadius', async () => {
            element.originalPriceFontColor = '#444444';

            await Promise.resolve();

            const cartItems = <HTMLElement[]>Array.from(element.querySelectorAll('commerce_cart-item'));
            expect(cartItems[0].style.cssText).not.toContain(
                '--com-c-cart-item-applied-savings-button-border-radius: 0px'
            );
        });
    });

    describe('a11y', () => {
        it('is accessible', () => {
            // Assert that the element is accessible
            return Promise.resolve().then(async () => {
                await expect(element).toBeAccessible();
            });
        });
    });
});
