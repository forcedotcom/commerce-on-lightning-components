import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import Badge from 'commerce_cart/badge';
import { navigate } from 'lightning/navigation';
import { CartSummaryAdapter } from 'commerce/cartApi';
import { MAX_CART_ITEMS_COUNT } from '../constants';

import type { CountType } from '../types';

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => 'current_cart'),
    NavigationContext: mockCreateTestWireAdapter(),
    navigate: jest.fn(),
    CurrentPageReference: mockCreateTestWireAdapter(),
}));

jest.mock('commerce/cartApi', () =>
    Object.assign({}, jest.requireActual('commerce/cartApi'), {
        CartSummaryAdapter: mockCreateTestWireAdapter(),
    })
);

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(() => Promise.resolve()),
    }),
    { virtual: true }
);

jest.mock('@salesforce/label/Commerce_Cart_Badge.maximumCount', () => ({ default: '{maximumCount}+' }), {
    virtual: true,
});

describe('Cart Badge', () => {
    let element: Badge & HTMLElement;

    const { location } = window;
    beforeAll(() => {
        // @ts-ignore
        delete window.location;
        // @ts-ignore
        window.location = { assign: jest.fn() };
    });
    afterAll(() => {
        window.location = location;
    });

    beforeEach(() => {
        element = createElement('commerce_cart-badge', {
            is: Badge,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            showCount: true,
            countType: 'Unique',
            totalProductCount: '10.0',
            uniqueProductCount: 3,
            expectedCount: '3',
        },
        {
            showCount: true,
            countType: 'Total',
            totalProductCount: '15.0',
            uniqueProductCount: 4,
            expectedCount: '15',
        },
        {
            showCount: true,
            countType: 'Total',
            totalProductCount: '15.555',
            uniqueProductCount: 6,
            expectedCount: '15.555',
        },
        {
            showCount: true,
            countType: 'Total',
            totalProductCount: `${MAX_CART_ITEMS_COUNT}`,
            uniqueProductCount: 6,
            expectedCount: `${MAX_CART_ITEMS_COUNT}`,
        },
        {
            showCount: true,
            countType: 'Total',
            totalProductCount: `${MAX_CART_ITEMS_COUNT + 1}`,
            uniqueProductCount: 6,
            expectedCount: `${MAX_CART_ITEMS_COUNT}+`,
        },
    ].forEach((propertyTest) => {
        it(`when showCount property is '${propertyTest.showCount}' and countType is '${propertyTest.countType}',
            it should display the total notification count badge with value of '${propertyTest.expectedCount}'`, () => {
            element.countType = propertyTest.countType as CountType;
            element.showCount = propertyTest.showCount;

            (<typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter).emit({
                data: {
                    totalProductCount: propertyTest.totalProductCount,
                    uniqueProductCount: propertyTest.uniqueProductCount,
                },
            });

            return Promise.resolve().then(() => {
                const badge = (<HTMLElement>element).querySelector('.slds-notification-badge');
                expect(badge).not.toBeNull();
                expect(badge?.textContent).toEqual(propertyTest.expectedCount);
            });
        });
    });

    [
        {
            showCount: false,
            totalProductCount: '10.0',
        },
        {
            showCount: true,
            totalProductCount: '0',
        },
    ].forEach((propertyTest) => {
        it(`when showCount property is '${propertyTest.showCount}' and the count is '${propertyTest.totalProductCount}',
            it should NOT display the total notification count badge`, () => {
            element.showCount = propertyTest.showCount;
            element.countType = 'Total';

            (<typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter).emit({
                data: {
                    totalProductCount: propertyTest.totalProductCount,
                },
            });

            return Promise.resolve().then(() => {
                const badge = (<HTMLElement>element).querySelector('.slds-notification-badge');
                expect(badge).toBeNull();
            });
        });
    });

    it('Data not retrieved properly, or no data, then count badge not visible', () => {
        element.showCount = true;
        element.countType = 'Total';

        (<typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter).emit({
            data: null,
            error: {},
        });

        return Promise.resolve().then(() => {
            const badge = (<HTMLElement>element).querySelector('.slds-notification-badge');
            expect(badge).toBeNull();
        });
    });

    it('Total is not correct numerical value, then count badge not visible', () => {
        element.showCount = true;
        element.countType = 'Total';

        (<typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter).emit({
            data: {
                totalProductCount: 'NotARealNumber',
            },
        });

        return Promise.resolve().then(() => {
            const badge = (<HTMLElement>element).querySelector('.slds-notification-badge');
            expect(badge).toBeNull();
        });
    });

    it('No data, then count badge not visible', () => {
        element.showCount = true;
        element.countType = 'Total';

        return Promise.resolve().then(() => {
            const badge = (<HTMLElement>element).querySelector('.slds-notification-badge');
            expect(badge).toBeNull();
        });
    });

    [
        {
            showCount: true,
            countType: 'Unique',
        },
        {
            showCount: true,
            countType: 'Total',
        },
        {
            showCount: false,
            countType: 'Unique',
        },
        {
            showCount: false,
            countType: 'Total',
        },
    ].forEach((propertyTest) => {
        it(`is accessible, when showCount is '${propertyTest.showCount}' and countType is '${propertyTest.countType}'`, () => {
            element.countType = propertyTest.countType as CountType;
            (<typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter).emit({
                data: {
                    totalProductCount: '10.0',
                    uniqueProductCount: 2,
                },
            });
            return Promise.resolve().then(async () => {
                await expect(element).toBeAccessible();
            });
        });
    });

    [
        {
            iconLinkColor: undefined,
            iconLinkHoverColor: undefined,
            expectedStyles:
                '--com-c-unified-cart-badge-link-color: initial; --com-c-unified-cart-badge-link-color-hover: initial;',
        },
        {
            iconLinkColor: '#aaaaaa',
            iconLinkHoverColor: undefined,
            expectedStyles:
                '--com-c-unified-cart-badge-link-color: #aaaaaa; --com-c-unified-cart-badge-link-color-hover: initial;',
        },
        {
            iconLinkColor: undefined,
            iconLinkHoverColor: '#ffffff',
            expectedStyles:
                '--com-c-unified-cart-badge-link-color: initial; --com-c-unified-cart-badge-link-color-hover: #ffffff;',
        },
        {
            iconLinkColor: '#000000',
            iconLinkHoverColor: '#ffffff',
            expectedStyles:
                '--com-c-unified-cart-badge-link-color: #000000; --com-c-unified-cart-badge-link-color-hover: #ffffff;',
        },
    ].forEach((propertyTest) => {
        it(`When iconLinkColor is '${propertyTest.iconLinkColor}' and iconLinkHoverColor is '${propertyTest.iconLinkHoverColor}'
            the style property should be:
                '${propertyTest.expectedStyles}'`, () => {
            element.iconLinkColor = propertyTest.iconLinkColor;
            element.iconLinkHoverColor = propertyTest.iconLinkHoverColor;

            return Promise.resolve().then(() => {
                const cartContainer = (<HTMLElement>element).querySelector('.cart-container');
                expect((<HTMLElement>cartContainer).style?.cssText).toBe(propertyTest.expectedStyles);
            });
        });
    });

    it('Url is generated', () => {
        const link = (<HTMLElement>element).querySelector('a');
        expect(link?.href).toBe('http://localhost/current_cart');
    });

    it('Navigate is called', () => {
        expect(navigate).not.toHaveBeenCalled();

        const link = (<HTMLElement>element).querySelector('a');
        link?.click();

        expect(navigate).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith(undefined, {
            type: 'comm__namedPage',
            attributes: {
                name: 'Current_Cart',
            },
        });
    });
});
