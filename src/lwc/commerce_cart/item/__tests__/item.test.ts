import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { sampleCartItemData } from './data/cartItemData';
import Item from 'commerce_cart/item';
import { DELETE_ITEM_EVENT, UPDATE_ITEM_EVENT, NAVIGATE_PRODUCT_EVENT } from 'commerce_cart/item';
import { displayDiscountPrice } from 'commerce_unified_promotions/discountPriceDisplayEvaluator';
import canDisplayOriginalPrice from 'commerce_cart/originalPriceDisplayEvaluator';

import type VariantAttributesDisplay from 'commerce_product_information/variantAttributesDisplay';
import type QuantitySelector from 'commerce/quantitySelector';
import type FieldDisplay from 'commerce/fieldDisplay';
import type { CartItemData } from 'commerce_data_provider/cartDataProvider';

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => Promise.resolve('test_product_url')),
    NavigationContext: mockCreateTestWireAdapter(),
}));

jest.mock('commerce_unified_promotions/discountPriceDisplayEvaluator', () => ({
    displayDiscountPrice: jest.fn(),
}));

jest.mock('commerce_cart/originalPriceDisplayEvaluator');

jest.mock('experience/resourceResolver', () => ({
    resolve: jest.fn((url) => url),
}));

describe('Cart Item', () => {
    let element: HTMLElement & Item;

    beforeEach(() => {
        element = createElement('commerce_cart-item', {
            is: Item,
        });
        element.item = sampleCartItemData;
        element.currencyIsoCode = 'USD';
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    describe('a11y', () => {
        it('should be accessible by default', async () => {
            await expect(element).toBeAccessible();
        });
    });

    it('maps the variants correctly', async () => {
        element.showProductVariants = true;
        element.item = sampleCartItemData;

        await Promise.resolve();

        const variantDisplayElement = <(HTMLElement & VariantAttributesDisplay) | null>(
            element.querySelector('commerce_product_information-variant-attributes-display')
        );
        expect(variantDisplayElement?.attributes).toEqual([
            {
                label: 'Flavor',
                name: 'Flavor',
                value: 'Chocolate',
                apiName: 'flavor',
                sequence: 1,
            },
            {
                label: 'Size',
                name: 'Size',
                value: '500mL',
                apiName: 'size',
                sequence: 1,
            },
        ]);
    });

    [
        { value: undefined, expected: 0 },
        { value: 0, expected: 0 },
        { value: 5, expected: 5 },
        { value: 1.5, expected: 1.5 },
    ].forEach((quantity) => {
        it(`parses the quantity value correctly when this.item.quantity = ${quantity.value}`, async () => {
            const sampleItem = { ...sampleCartItemData };
            sampleItem.quantity = quantity.value;
            element.item = sampleItem;

            await Promise.resolve();

            const quantitySelector = <(HTMLElement & QuantitySelector) | null>(
                element.querySelector('commerce-quantity-selector')
            );
            expect(quantitySelector?.value).toBe(quantity.expected);
        });
    });

    it('fires the "deletecartitem" event when the remove button is clicked', async () => {
        const eventHandler = jest.fn();
        element.addEventListener(DELETE_ITEM_EVENT, eventHandler);

        element.showRemoveItem = true;

        await Promise.resolve();

        const removeItemButton = element.querySelector('.main_actions_remove');

        removeItemButton?.dispatchEvent(new CustomEvent('click'));

        expect(eventHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: sampleCartItemData.id,
            })
        );
    });

    it('fires the "navigatetoproduct" event when the image is clicked', async () => {
        const eventHandler = jest.fn();
        element.addEventListener(NAVIGATE_PRODUCT_EVENT, eventHandler);

        element.showProductImage = true;

        await Promise.resolve();

        const imageElement = element.querySelector('.product-image a');

        imageElement?.dispatchEvent(new CustomEvent('click'));

        expect(eventHandler.mock.calls[0][0].detail).toBe(sampleCartItemData.ProductDetails.productId);
    });

    it('fires the "navigatetoproduct" event when the product name is clicked', () => {
        const eventHandler = jest.fn();
        element.addEventListener(NAVIGATE_PRODUCT_EVENT, eventHandler);

        const itemName = element.querySelector('.main_details_description_name');

        itemName?.dispatchEvent(new CustomEvent('click'));

        expect(eventHandler.mock.calls[0][0].detail).toBe(sampleCartItemData.ProductDetails.productId);
    });

    it('retrieves the correct custom field values', async () => {
        element.productFieldMapping = [
            {
                name: 'Description',
                label: 'Product Description',
                type: 'TEXTAREA',
            },
            {
                name: 'Name',
                label: 'Product Name',
                type: 'STRING',
            },
            {
                name: 'StockKeepingUnit',
                label: 'Product SKU',
                type: 'STRING',
            },
        ];

        await Promise.resolve();

        const fieldDisplays = <NodeListOf<HTMLElement & FieldDisplay>>(
            element.querySelectorAll('commerce-field-display')
        );
        expect(fieldDisplays[0].value).toBe('Alpine Blends GoBrew Mocha Coffee in 6 oz can.');
        expect(fieldDisplays[1].value).toBe('GoBrew Moca MCT + Protein Vegetarian, 6 oz can - 6 pack');
        expect(fieldDisplays[2].value).toBe('6010006');
    });

    it('only displays field mappings with non-blanks values', async () => {
        element.productFieldMapping = [
            {
                name: 'Description',
                label: 'Product Description',
                type: 'TEXTAREA',
            },
            {
                name: 'Name',
                label: 'Product Name',
                type: 'STRING',
            },
            {
                name: 'Family',
                label: 'Family',
                type: 'STRING',
            },
        ];

        await Promise.resolve();

        const fieldDisplays = <NodeListOf<HTMLElement & FieldDisplay>>(
            element.querySelectorAll('commerce-field-display')
        );
        expect(fieldDisplays).toHaveLength(2);
    });

    it('displays the actual price', async () => {
        element.showTotalPrices = true;
        element.showActualPrice = true;

        await Promise.resolve();

        const actualPriceEle = element.querySelector('.actualPrice');
        expect(actualPriceEle).not.toBeNull();
    });

    it('displays the unit price', async () => {
        element.showPricePerUnit = true;

        await Promise.resolve();

        const unitPriceEle = element.querySelector('.unitPrice');
        expect(unitPriceEle).not.toBeNull();
    });

    describe('thumbnailImageUrl', () => {
        beforeEach(() => {
            element.showProductImage = true;
        });
        it('displays thumbnailImage.url', () => {
            const productImage: HTMLImageElement | null = element.querySelector('.product-image img');
            expect(productImage?.src).toBe('http://localhost' + sampleCartItemData.ProductDetails.thumbnailImage?.url);
        });

        it('displays thumbnailImage.thumbnailUrl', async () => {
            const sampleCartDataClone: CartItemData = JSON.parse(JSON.stringify(sampleCartItemData));

            if (sampleCartDataClone?.ProductDetails?.thumbnailImage?.thumbnailUrl !== undefined) {
                sampleCartDataClone.ProductDetails.thumbnailImage.thumbnailUrl = '/sampleimage.jpg';
            }

            element.item = sampleCartDataClone;

            await Promise.resolve();

            const productImage: HTMLImageElement | null = element.querySelector('.product-image img');
            expect(productImage?.src).toBe(
                'http://localhost' + sampleCartDataClone.ProductDetails.thumbnailImage?.thumbnailUrl
            );
        });

        it('displays nothing', async () => {
            const sampleCartDataClone: CartItemData = JSON.parse(JSON.stringify(sampleCartItemData));

            if (sampleCartDataClone?.ProductDetails?.thumbnailImage?.url !== undefined) {
                sampleCartDataClone.ProductDetails.thumbnailImage.url = null;
            }

            element.item = sampleCartDataClone;

            await Promise.resolve();

            const productImage: HTMLImageElement | null = element.querySelector('.product-image img');
            expect(productImage?.src).toBe('http://localhost/');
        });
    });

    describe('"Show Original Price" Property', () => {
        it('shows the original price when canDisplayOriginalPrice return true', async () => {
            (<jest.Mock>canDisplayOriginalPrice).mockReturnValue(true);
            element.showTotalPrices = true;

            await Promise.resolve();

            const originalPriceElement = element.querySelector('.originalPrice');

            expect(originalPriceElement).not.toBeNull();
        });

        it('does not show the original price when canDisplayOriginalPrice returns false', async () => {
            (<jest.Mock>canDisplayOriginalPrice).mockReturnValue(false);
            element.showTotalPrices = true;

            await Promise.resolve();

            const originalPriceElement = element.querySelector('.originalPrice');

            expect(originalPriceElement).toBeNull();
        });

        it('does not show the original price when canDisplayOriginalPrice returns false, item undefined', async () => {
            (<jest.Mock>canDisplayOriginalPrice).mockReturnValue(false);
            element.showTotalPrices = true;
            element.item = undefined;
            await Promise.resolve();

            const originalPriceElement = element.querySelector('.originalPrice');

            expect(originalPriceElement).toBeNull();
        });
    });

    describe('"Show Discounted Price" Property', () => {
        it('shows the discount price when displayDiscountPrice returns true', async () => {
            (<jest.Mock>displayDiscountPrice).mockReturnValue(true);
            element.showPromotions = true;
            await Promise.resolve();

            const discountPriceElement = element.querySelector('.discount-price');

            expect(discountPriceElement).not.toBeNull();
        });

        it('does not show the discount price when displayDiscountPrice returns false', async () => {
            (<jest.Mock>displayDiscountPrice).mockReturnValue(false);
            element.showPromotions = true;

            await Promise.resolve();

            const discountPriceElement = element.querySelector('.discount-price');

            expect(discountPriceElement).toBeNull();
        });
    });

    describe('Handle Value Changed" Event Handler', () => {
        it('fires "updatecartitem" when first time the quantity is changed', () => {
            const eventHandler = jest.fn();
            element.addEventListener(UPDATE_ITEM_EVENT, eventHandler);

            const quantitySelector = <(HTMLElement & QuantitySelector) | null>(
                element.querySelector('commerce-quantity-selector')
            );
            quantitySelector?.dispatchEvent(
                new CustomEvent('valuechanged', {
                    detail: {
                        value: 6,
                        lastValue: 7,
                    },
                })
            );

            expect(eventHandler.mock.calls[0][0].detail).toEqual({
                cartItemId: sampleCartItemData.id,
                quantity: 6,
            });
        });

        it('fires "updatecartitem" when second time the quantity selector fires "valuechanged" with different values', () => {
            const eventHandler = jest.fn();
            element.addEventListener(UPDATE_ITEM_EVENT, eventHandler);

            const quantitySelector = <(HTMLElement & QuantitySelector) | null>(
                element.querySelector('commerce-quantity-selector')
            );
            quantitySelector?.dispatchEvent(
                new CustomEvent('valuechanged', {
                    detail: {
                        value: 6,
                        lastValue: 7,
                    },
                })
            );

            quantitySelector?.dispatchEvent(
                new CustomEvent('valuechanged', {
                    detail: {
                        value: 7,
                        lastValue: 6,
                    },
                })
            );

            expect(eventHandler).toHaveBeenCalledTimes(2);
            expect(eventHandler.mock.calls[0][0].detail).toEqual({
                cartItemId: sampleCartItemData.id,
                quantity: 6,
            });
            expect(eventHandler.mock.calls[1][0].detail).toEqual({
                cartItemId: sampleCartItemData.id,
                quantity: 7,
            });
        });

        it('does not fire "updatecartitem" when second time the quantity selector fires "valuechanged" again with the same values', () => {
            const eventHandler = jest.fn();
            element.addEventListener(UPDATE_ITEM_EVENT, eventHandler);

            const quantitySelector = <(HTMLElement & QuantitySelector) | null>(
                element.querySelector('commerce-quantity-selector')
            );
            quantitySelector?.dispatchEvent(
                new CustomEvent('valuechanged', {
                    detail: {
                        value: 6,
                        lastValue: 7,
                    },
                })
            );

            quantitySelector?.dispatchEvent(
                new CustomEvent('valuechanged', {
                    detail: {
                        value: 6,
                        lastValue: 7,
                    },
                })
            );

            expect(eventHandler).toHaveBeenCalledTimes(1);
            expect(eventHandler.mock.calls[0][0].detail).toEqual({
                cartItemId: sampleCartItemData.id,
                quantity: 6,
            });
        });
    });
});
