import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import PurchaseOptions from '../purchaseOptions';
import { getProductDetailData } from './data/product.mock';
import { SessionContextAdapter } from 'commerce/contextApi';
import type { PageReference } from 'types/common';
import type { DataProviderActionEvent } from 'experience/dataProvider';
import type { LightningDialog } from '../types';
import type { SelectedQuantityChangedPayload } from 'src/lwc/commerce_data_provider/productDataProvider/types';
import { StoreActionError } from 'experience/store';
let exposedNavigationParams: PageReference | undefined;

jest.mock(
    'lightning/navigation',
    () => ({
        generateUrl: jest.fn(() => ''),
        NavigationContext: jest.fn(),
        navigate: jest.fn((_, params) => {
            exposedNavigationParams = params;
        }),
    }),
    { virtual: true }
);

// The mockFn is needed to test whether Toast.show was called, simply spying on Toast.show does not work
const mockTestFn = jest.fn();
jest.mock('lightning/toast', () => ({
    show: jest.fn((param) => mockTestFn(param)),
}));

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('commerce/contextApi', () => ({
    SessionContextAdapter: mockCreateTestWireAdapter(),
}));

jest.mock(
    '@salesforce/label/Commerce_Product_Details_Add_To_Cart_Error.addItemToCartMaximumCartSizeErrorMessage',
    () => {
        return {
            default: 'Your cart is full.',
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/label/Commerce_Product_Details_Add_To_Cart_Error.genericAddToCartErrorMessage',
    () => {
        return {
            default: 'An unexpected error occurred. Try again later.',
        };
    },
    { virtual: true }
);

// Declaring AddQuantity type as the component hasn't been converted to TypeScript yet.
declare type AddQuantity = {
    disabled: boolean;
    incrementText: string;
    maximumText: string;
    minimumText: string;
};

// Define payload type for DataProviderActionEvent('product:addItemToCart', ...)
declare type AddItemToCartEventPayload = {
    quantity: string;
};

const ADD_PRODUCT_TO_CART_EVT = 'addproducttocart';
const SELECTED_QUANTITY_CHANGED_EVT = 'valuechanged';

describe('commerce_builder/purchaseOptions', () => {
    let element: HTMLElement & PurchaseOptions;
    beforeEach(() => {
        element = createElement('commerce_builder-purchase-options', {
            is: PurchaseOptions,
        });

        (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
            data: { isLoggedIn: true },
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
        exposedNavigationParams = undefined;
    });

    // TODO Move this to the inner components instead?
    it('should be accessible', async () => {
        element.product = getProductDetailData();
        element.addToCartButtonText = 'Add to Cart';
        element.quantitySelectorLabel = 'QTY';
        await Promise.resolve();

        await expect(element).toBeAccessible();
    });

    it('should define button border radius css variable with px when set', async () => {
        element.addToCartButtonBorderRadius = 16;
        element.product = getProductDetailData();
        await Promise.resolve();

        const containerElem = <HTMLElement>element.querySelector('.quantity-list-container');

        expect(containerElem.style.cssText).toContain(
            '--com-c-product-details-add-to-cart-button-border-radius: 16px;'
        );
    });

    it('should show commerce_product_details-add-quantity', async () => {
        element.product = getProductDetailData();
        await Promise.resolve();

        const addQuantitySection = element.querySelector('commerce_product_details-add-quantity');
        expect(addQuantitySection).toBeTruthy();
    });

    describe('commerce_product_details-add-quantity.disabled', () => {
        it('should be true when product type is variant parent', async () => {
            element.product = getProductDetailData();
            await Promise.resolve();

            const addQuantity = <HTMLElement & AddQuantity>(
                element.querySelector('commerce_product_details-add-quantity')
            );

            expect(addQuantity.disabled).toBe(true);
        });

        it('should be false when product type is simple', async () => {
            const mockProduct = getProductDetailData();
            mockProduct.productClass = 'Simple';
            element.product = mockProduct;
            await Promise.resolve();

            const addQuantity = <HTMLElement & AddQuantity>(
                element.querySelector('commerce_product_details-add-quantity')
            );

            expect(addQuantity.disabled).toBe(false);
        });

        it('be false when variant selection is valid', async () => {
            const mockProduct = getProductDetailData();
            mockProduct.productClass = 'Variation';
            element.product = mockProduct;
            element.productVariant = { isValid: true, options: ['Blue', ''] };
            await Promise.resolve();

            const addQuantity = <HTMLElement & AddQuantity>(
                element.querySelector('commerce_product_details-add-quantity')
            );

            expect(addQuantity.disabled).toBe(false);
        });

        it('be true when variant selection is invalid', async () => {
            const mockProduct = getProductDetailData();
            mockProduct.productClass = 'Variation';
            element.product = mockProduct;
            element.productVariant = { isValid: false, options: ['Blue', ''] };
            await Promise.resolve();

            const addQuantity = <HTMLElement & AddQuantity>(
                element.querySelector('commerce_product_details-add-quantity')
            );

            expect(addQuantity.disabled).toBe(true);
        });

        it('should display quantity-list-action div if product detail data is available', async () => {
            element.product = getProductDetailData();
            await Promise.resolve();
            const quantityListActionContainer = <HTMLElement>element.querySelector('.quantity-list-action');
            expect(quantityListActionContainer).toBeTruthy();
        });

        it('should hide quantity-list-action div if product detail data is undefined', async () => {
            element.product = undefined;
            await Promise.resolve();
            const quantityListActionContainer = <HTMLElement>element.querySelector('.quantity-list-action');
            expect(quantityListActionContainer).toBeFalsy();
        });
        it('should hide quantity-list-action div if product detail data is null', async () => {
            element.product = null;
            await Promise.resolve();
            const quantityListActionContainer = <HTMLElement>element.querySelector('.quantity-list-action');
            expect(quantityListActionContainer).toBeFalsy();
        });
    });

    describe('when add to cart event received', () => {
        it('should navigate to login page user is guest', async () => {
            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: false },
            });
            element.product = getProductDetailData();
            await Promise.resolve();

            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
            const addQuantityCmp = <HTMLElement & AddQuantity>(
                element.querySelector('commerce_product_details-add-quantity')
            );
            addQuantityCmp.dispatchEvent(
                new CustomEvent(ADD_PRODUCT_TO_CART_EVT, {
                    detail: { quantity: '4' },
                })
            );
            await Promise.resolve();

            expect(dispatchSpy).not.toHaveBeenCalled();
            expect(exposedNavigationParams).toEqual({
                type: 'comm__namedPage',
                attributes: {
                    name: 'Login',
                },
            });
        });

        it('should dispatch data provider when user authenticated', async () => {
            element.product = getProductDetailData();
            await Promise.resolve();

            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
            const expectedQuantity = '4';
            const addQuantityCmp = <HTMLElement & AddQuantity>(
                element.querySelector('commerce_product_details-add-quantity')
            );
            addQuantityCmp.dispatchEvent(
                new CustomEvent(ADD_PRODUCT_TO_CART_EVT, {
                    detail: { quantity: expectedQuantity },
                })
            );
            await Promise.resolve();

            // Validate DataProviderActionEvent dispatched with appropriate payload
            expect(dispatchSpy).toHaveBeenCalledTimes(1);
            const eventDetail = (<DataProviderActionEvent<AddItemToCartEventPayload>>dispatchSpy.mock.calls[0][0])
                .detail;
            expect(eventDetail.payload?.quantity).toBe(expectedQuantity);
        });

        it('should show confirmation modal when onSuccess hook called', async () => {
            element.product = getProductDetailData();
            await Promise.resolve();

            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
            // Spy on showModal() method on dialog
            const modalElem = <LightningDialog & Element>element.querySelector('lightning-dialog');
            const showModalSpy = jest.spyOn(modalElem, 'showModal');

            // Dispatch add to cart event
            const addQuantityCmp = <HTMLElement & AddQuantity>(
                element.querySelector('commerce_product_details-add-quantity')
            );
            addQuantityCmp.dispatchEvent(
                new CustomEvent(ADD_PRODUCT_TO_CART_EVT, {
                    detail: { quantity: 1 },
                })
            );
            await Promise.resolve();

            // Call onSuccess callback
            const eventDetail = (<DataProviderActionEvent<AddItemToCartEventPayload>>dispatchSpy.mock.calls[0][0])
                .detail;
            const eventDetailOptions = eventDetail.options;
            eventDetailOptions.onSuccess?.(undefined, true);
            await Promise.resolve();

            expect(showModalSpy).toHaveBeenCalledTimes(1);
        });

        it('should dispatch show toast event when onError hook called', async () => {
            // mock error object
            const response = jest.fn().mockResolvedValue(
                new StoreActionError({
                    code: 'LIMIT_EXCEEDED',
                })
            );
            const error = await response();
            element.product = getProductDetailData();
            await Promise.resolve();

            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
            // Dispatch add to cart event
            const addQuantityCmp = <HTMLElement & AddQuantity>(
                element.querySelector('commerce_product_details-add-quantity')
            );
            addQuantityCmp.dispatchEvent(
                new CustomEvent(ADD_PRODUCT_TO_CART_EVT, {
                    detail: { quantity: 1 },
                })
            );
            await Promise.resolve();

            // Call onError callback
            const eventDetail = (<DataProviderActionEvent<AddItemToCartEventPayload>>dispatchSpy.mock.calls[0][0])
                .detail;
            const eventDetailOptions = eventDetail.options;
            eventDetailOptions.onError?.(error, true);

            // Validate onError Callback
            await Promise.resolve();
            expect(mockTestFn).toHaveBeenCalledWith({ label: 'Your cart is full.', variant: 'error' });
        });

        it('should dispatch show toast event even when network is down', async () => {
            element.product = getProductDetailData();
            const message = 'An unexpected error occurred. Try again later.';
            await Promise.resolve();

            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
            // Dispatch add to cart event
            const addQuantityCmp = <HTMLElement & AddQuantity>(
                element.querySelector('commerce_product_details-add-quantity')
            );
            addQuantityCmp.dispatchEvent(
                new CustomEvent(ADD_PRODUCT_TO_CART_EVT, {
                    detail: { quantity: 1 },
                })
            );
            await Promise.resolve();

            // Call onError callback
            const eventDetail = (<DataProviderActionEvent<AddItemToCartEventPayload>>dispatchSpy.mock.calls[0][0])
                .detail;
            const eventDetailOptions = eventDetail.options;
            eventDetailOptions.onError?.(undefined, true);

            // Validate onError Callback
            await Promise.resolve();
            expect(mockTestFn).toHaveBeenCalledWith({ label: message, variant: 'error' });
        });

        it('should close dialog when continue shopping button clicked', async () => {
            element.product = getProductDetailData();
            await Promise.resolve();

            const modalElem = <LightningDialog & Element>element.querySelector('lightning-dialog');
            modalElem?.showModal();
            await Promise.resolve();

            // Click "Continue Shopping" button
            const continueButton = <HTMLButtonElement>element.querySelector('lightning-dialog .slds-button_neutral');
            expect(continueButton).toBeTruthy();
            continueButton.click();

            await Promise.resolve(); // Wait for navigation

            expect(exposedNavigationParams).toBeUndefined();
        });

        it('should navigate to cart when view cart button clicked', async () => {
            element.product = getProductDetailData();
            await Promise.resolve();

            const modalElem = <LightningDialog & Element>element.querySelector('lightning-dialog');
            modalElem?.showModal();
            await Promise.resolve();

            // Click "Continue Shopping" button
            const viewCartButton = <HTMLButtonElement>element.querySelector('lightning-dialog .slds-button_brand');
            expect(viewCartButton).toBeTruthy();
            viewCartButton.click();

            await Promise.resolve(); // Wait for navigation

            expect(exposedNavigationParams).toEqual({ attributes: { name: 'Current_Cart' }, type: 'comm__namedPage' });
        });

        it('adjusts addQuantity component according to purchase quantity rule', async () => {
            element.product = getProductDetailData();
            element.quantitySelectorLabel = 'QTY';
            element.minimumValueGuideText = 'minimum number is {0}';
            element.maximumValueGuideText = 'maximum number is {0}';
            element.incrementValueGuideText = 'increment number is {0}';

            await Promise.resolve();

            const addQuantity = <HTMLElement & AddQuantity>(
                element.querySelector('commerce_product_details-add-quantity')
            );

            expect(addQuantity.incrementText).toBe('increment number is 2');
            expect(addQuantity.maximumText).toBe('maximum number is 100');
            expect(addQuantity.minimumText).toBe('minimum number is 2');
        });

        it('adjusts addQuantity component according to purchase quantity rule with no maximum text', async () => {
            element.product = getProductDetailData();
            element.quantitySelectorLabel = 'QTY';
            element.minimumValueGuideText = 'minimum number is {0}';
            element.incrementValueGuideText = 'increment number is {0}';

            await Promise.resolve();

            const addQuantity = <HTMLElement & AddQuantity>(
                element.querySelector('commerce_product_details-add-quantity')
            );

            expect(addQuantity.incrementText).toBe('increment number is 2');
            expect(addQuantity.maximumText).toBe('');
            expect(addQuantity.minimumText).toBe('minimum number is 2');
        });

        it('adjusts addQuantity component according to purchase quantity rule when no max, min, or increment text is set', async () => {
            element.product = getProductDetailData();
            element.quantitySelectorLabel = 'QTY';
            await Promise.resolve();

            const addQuantity = <HTMLElement & AddQuantity>(
                element.querySelector('commerce_product_details-add-quantity')
            );

            //if minimumValueGuideText, incrementValueGuideText, and maximumValueGuideText is not passed it will be just a empty string
            expect(addQuantity.incrementText).toBe('');
            expect(addQuantity.maximumText).toBe('');
            expect(addQuantity.minimumText).toBe('');
        });

        it('not render PQR text combinedtext', async () => {
            element.product = getProductDetailData();
            element.quantitySelectorLabel = 'QTY';
            await Promise.resolve();

            const addQuantity = <HTMLElement & AddQuantity>(
                element.querySelector('commerce_product_details-add-quantity')
            );

            //if minimumValueGuideText, incrementValueGuideText, and maximumValueGuideText is not passed it will be just a empty string
            expect(addQuantity.incrementText).toBe('');
            expect(addQuantity.maximumText).toBe('');
            expect(addQuantity.minimumText).toBe('');
        });
    });

    it('display quantity-rule selector for valid purchaseQuantityRule', async () => {
        element.product = getProductDetailData();
        element.quantitySelectorLabel = 'QTY';
        element.minimumValueGuideText = 'minimum number is {0}';
        element.maximumValueGuideText = 'maximum number is {0}';
        element.incrementValueGuideText = 'increment number is {0}';

        await Promise.resolve();

        const quantityListContiner = <HTMLElement>element.querySelector('.quantity-rule');

        expect(quantityListContiner).toBeTruthy();
        expect(element.product.purchaseQuantityRule).toStrictEqual({
            minimum: '2',
            maximum: '100',
            increment: '2',
            minimumNumber: 2,
            maximumNumber: 100,
            incrementNumber: 2,
        });
    });

    it('hide quantity-rule selector for invalid purchaseQuantityRule', async () => {
        element.product = { ...getProductDetailData(), purchaseQuantityRule: null };
        element.quantitySelectorLabel = 'QTY';
        element.minimumValueGuideText = 'minimum number is {0}';
        element.maximumValueGuideText = 'maximum number is {0}';
        element.incrementValueGuideText = 'increment number is {0}';

        await Promise.resolve();

        const quantityListContiner = <HTMLElement>element.querySelector('.quantity-rule');

        expect(element.product.purchaseQuantityRule).toBeNull();
        expect(quantityListContiner).toBeNull();
    });

    it('hide quantity-rule selector for invalid minimum purchaseQuantityRule', async () => {
        element.product = {
            ...getProductDetailData(),
            purchaseQuantityRule: {
                minimum: null,
                maximum: '100',
                increment: '2',
                minimumNumber: null,
                maximumNumber: 100,
                incrementNumber: 2,
            },
        };
        element.quantitySelectorLabel = 'QTY';
        element.minimumValueGuideText = 'minimum number is {0}';
        element.maximumValueGuideText = 'maximum number is {0}';
        element.incrementValueGuideText = 'increment number is {0}';

        await Promise.resolve();

        const quantityListContiner = <HTMLElement>element.querySelector('.quantity-rule');

        expect(element.product.purchaseQuantityRule).toStrictEqual({
            increment: '2',
            incrementNumber: 2,
            maximum: '100',
            maximumNumber: 100,
            minimum: null,
            minimumNumber: null,
        });
        expect(quantityListContiner).toBeNull();
    });

    it('hide quantity-rule selector for invalid maximum purchaseQuantityRule', async () => {
        element.product = {
            ...getProductDetailData(),
            purchaseQuantityRule: {
                minimum: '2',
                maximum: null,
                increment: '2',
                minimumNumber: 2,
                maximumNumber: null,
                incrementNumber: 2,
            },
        };
        element.quantitySelectorLabel = 'QTY';
        element.minimumValueGuideText = 'minimum number is {0}';
        element.maximumValueGuideText = 'maximum number is {0}';
        element.incrementValueGuideText = 'increment number is {0}';

        await Promise.resolve();

        const quantityListContiner = <HTMLElement>element.querySelector('.quantity-rule');

        expect(quantityListContiner).toBeNull();
        expect(element.product.purchaseQuantityRule).toStrictEqual({
            increment: '2',
            incrementNumber: 2,
            maximum: null,
            maximumNumber: null,
            minimum: '2',
            minimumNumber: 2,
        });
    });

    it('should dispatch the currentquantity to data provider', async () => {
        element.product = getProductDetailData();
        await Promise.resolve();

        const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
        const addQuantity = <HTMLElement & AddQuantity>element.querySelector('commerce_product_details-add-quantity');
        const currentQuantity = 4;
        addQuantity.dispatchEvent(
            new CustomEvent(SELECTED_QUANTITY_CHANGED_EVT, {
                bubbles: false,
                cancelable: false,
                composed: false,
                detail: { value: currentQuantity },
            })
        );
        await Promise.resolve();
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        const eventDetail = (<DataProviderActionEvent<SelectedQuantityChangedPayload>>dispatchSpy.mock.calls[0][0])
            .detail;
        expect(eventDetail.payload?.quantity).toBe(currentQuantity);
    });
});
