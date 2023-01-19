import type { TestWireAdapter } from 'types/testing';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { NavigationContext } from 'lightning/navigation';
import { createElement } from 'lwc';
import OrderItemInfo from 'commerce_my_account/orderItemInfo';
import ItemFields from 'commerce_my_account/itemFields';
const NAV_TO_PRODUCT_DETAIL_EVENT = 'navigatetoproductdetailpage';

import {
    ItemWithFiveFields,
    ItemWithInvalidProduct,
    ItemWithMedia,
    ItemWithMediaWithoutAltText,
    ItemWithoutMedia,
    ItemWithoutMediaUrl,
    ItemWithoutVariants,
    ItemWithSixFields,
    ItemWithTotalPriceAndQuantity,
    ItemWithTotalPriceAndOnlyOneQuantity,
    ItemWithVariants,
    ItemWithNoName,
    ItemWithNoField,
} from './data/orderItemInfoData';

const mockNavigate = jest.fn();
const mockGeneratedUrl = '/b2c/s/detail/0a9000000000001AAA';

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => mockGeneratedUrl),
    NavigationContext: mockCreateTestWireAdapter(),
    navigate: jest.fn(),
}));

jest.mock('experience/resourceResolver', () => ({
    resolve: jest
        .fn()
        .mockReturnValue(
            'https://s3.amazonaws.com/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine-energy-goBAR-cranberry.jpg'
        ),
}));
//Mock the labels
jest.mock('../labels.ts', () => ({
    productImageAltText: 'Product Image',
}));

describe('commerce_my_account-order-item-info: order item information', () => {
    let element: HTMLElement & OrderItemInfo;

    beforeEach(async () => {
        mockNavigate.mockReset();
        element = createElement('commerce_my_account-order-item-info', {
            is: OrderItemInfo,
        });
        (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({
            test: 'test',
        });

        await document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'currencyCode',
            defaultValue: undefined,
            changeValue: 'USD',
        },
        {
            property: 'productUnavailableMessage',
            defaultValue: undefined,
            changeValue: 'unavailable',
        },
        {
            property: 'showImage',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'showTotal',
            defaultValue: false,
            changeValue: true,
        },

        {
            property: 'textDisplayInfo',
            defaultValue: undefined,
            changeValue: { headingTag: 'h2', textStyle: 'heading-large' },
        },
        {
            property: 'orderItem',
            defaultValue: undefined,
            changeValue: ItemFields,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof OrderItemInfo]).toBe(propertyTest.defaultValue);
            });
            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof OrderItemInfo]).not.toBe(propertyTest.changeValue);
                // Change the value.
                //@ts-ignore
                element[propertyTest.property as keyof OrderItemInfo] = propertyTest.changeValue;
                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof OrderItemInfo]).toStrictEqual(propertyTest.changeValue);
            });
        });
    });

    it('is accessible', () => {
        element.orderItem = ItemWithTotalPriceAndQuantity;
        element.currencyCode = 'USD';
        element.showImage = true;
        element.showTotal = true;
        return Promise.resolve().then(async () => {
            expect.assertions(1);
            await expect(element).toBeAccessible();
        });
    });

    describe('Product Url', () => {
        it('Product Url generated from call in orderItem setter', () => {
            element.orderItem = ItemWithMedia;
            element.showImage = true;
            const settled = new Promise((resolve) => {
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                setTimeout(resolve, 0);
            });
            return settled.then(() => {
                const anchor: HTMLAnchorElement | null = element.querySelector('a');
                expect(anchor?.href).toBe('http://localhost/b2c/s/detail/0a9000000000001AAA');
            });
        });
        it('Product Url generated from call in navigationContextHandler', async () => {
            const el: HTMLElement & OrderItemInfo = createElement('commerce_my_account-order-item-info', {
                is: OrderItemInfo,
            });
            (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({
                test: 'test',
            });
            el.orderItem = ItemWithMedia;
            el.showImage = true;

            document.body.appendChild(el);
            await Promise.resolve();
            const settled = new Promise((resolve) => {
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                setTimeout(resolve, 0);
            });
            return settled.then(() => {
                const anchor: HTMLAnchorElement | null = el.querySelector('a');
                expect(anchor?.href).toBe('http://localhost/b2c/s/detail/0a9000000000001AAA');
            });
        });
    });

    describe('product image', () => {
        it('displays image if attribute showImage is true and media is present in orderItem', () => {
            element.orderItem = ItemWithMedia;
            element.showImage = true;
            return Promise.resolve().then(() => {
                const img: HTMLImageElement | null = element.querySelector('img');
                expect(img?.src).toBe(ItemWithMedia?.media?.url);
            });
        });

        it("doesn't display image if attribute showImage is false", () => {
            element.orderItem = ItemWithMedia;
            element.showImage = false;
            return Promise.resolve().then(() => {
                expect(element.querySelector('img')).toBeNull();
            });
        });

        it("displays default alt if alternate Text isn't present", () => {
            element.orderItem = ItemWithMediaWithoutAltText;
            element.showImage = true;
            return Promise.resolve().then(() => {
                const image: HTMLImageElement | null = element.querySelector("img[alt='Product Image']");
                expect(image).not.toBeNull();
            });
        });

        it('displays alternative text found in the media when it is present', () => {
            element.orderItem = ItemWithMedia;
            element.showImage = true;
            return Promise.resolve().then(() => {
                const image: HTMLImageElement | null = element.querySelector(
                    "img[alt='GoBar Cranberry Hi Protein, 2oz - 6 pack']"
                );
                expect(image).not.toBeNull();
            });
        });

        [
            { key: 'ItemWithoutMedia', value: ItemWithoutMedia },
            { key: 'ItemWithoutMediaUrl', value: ItemWithoutMediaUrl },
            { key: 'undefined', value: undefined },
        ].forEach((orderItem) => {
            it(`doesn't display image if attribute showImage is true but orderItem is ${orderItem.key}`, () => {
                element.orderItem = orderItem.value;
                element.showImage = true;
                return Promise.resolve().then(() => {
                    expect(element.querySelector('img')).toBeNull();
                });
            });
        });

        it('does not have a clickable image when the product is invalid.', () => {
            element.orderItem = ItemWithInvalidProduct;
            element.showImage = true;
            return Promise.resolve().then(() => {
                const productTitleAnchor = element.querySelector('a > img');
                expect(productTitleAnchor).toBeNull();
            });
        });

        it('has a clickable image when the product is valid.', () => {
            element.orderItem = ItemWithMedia;
            element.showImage = true;
            return Promise.resolve().then(() => {
                const productTitleAnchor = element.querySelector('a > img');
                expect(productTitleAnchor).not.toBeNull();
            });
        });

        it(`triggers event ${NAV_TO_PRODUCT_DETAIL_EVENT} on product image click`, () => {
            const handler = jest.fn();
            element.addEventListener(NAV_TO_PRODUCT_DETAIL_EVENT, handler);
            element.orderItem = ItemWithMedia;
            element.showImage = true;
            return Promise.resolve().then(() => {
                const productImage: HTMLAnchorElement | null = element.querySelector('figure > a');
                productImage?.click();
                expect(handler).toHaveBeenCalledTimes(1);
                expect(handler).toHaveBeenCalledWith(
                    expect.objectContaining({
                        detail: {
                            productId: ItemWithMedia.productId,
                        },
                    })
                );
            });
        });
    });
    describe('Product Title', () => {
        it('renders the product title component when the order item has a name.', () => {
            element.orderItem = ItemWithMedia;
            return Promise.resolve().then(() => {
                const productTitle: HTMLElement | null = element.querySelector('commerce_my_account-product-title');
                expect(productTitle).not.toBeNull();
            });
        });
        it('does not render the product title component when the order item does not have a name.', () => {
            element.orderItem = ItemWithNoName;
            return Promise.resolve().then(() => {
                const productTitle = element.querySelector('commerce_my_account-product-title');
                expect(productTitle).toBeNull();
            });
        });
    });

    describe('Product variants', () => {
        it('displays product variants if variants are present in the order item', () => {
            element.orderItem = ItemWithVariants;
            return Promise.resolve().then(() => {
                const variants = element.querySelector('commerce_product_information-variant-attributes-display');
                expect(variants).not.toBeNull();
            });
        });

        it("doesn't displays product variants if variant aren't present in the order item", () => {
            element.orderItem = ItemWithoutVariants;
            return Promise.resolve().then(() => {
                const variants = element.querySelector('commerce_product_information-variant-attributes-display');
                expect(variants).toBeNull();
            });
        });
    });

    describe('Product Fields', () => {
        it('displays no item fields if fields are undefined', () => {
            element.orderItem = ItemWithNoField;
            return Promise.resolve().then(() => {
                const ItemFieldsComponents = element.querySelector('commerce_my_account-item-fields');
                expect(ItemFieldsComponents).toBeNull();
            });
        });
        it('displays only one column of item fields if orderItem has less than 6 fields and show total is not selected', () => {
            element.orderItem = ItemWithFiveFields;
            return Promise.resolve().then(() => {
                const ItemFieldsComponents = element.querySelectorAll('commerce_my_account-item-fields');
                expect(ItemFieldsComponents).toHaveLength(1);
            });
        });
        it('creates two commerce item fields if orderItem has more than 5 fields', () => {
            element.orderItem = ItemWithSixFields;
            return Promise.resolve().then(() => {
                const ItemFieldsComponents = element.querySelectorAll('commerce_my_account-item-fields');
                expect(ItemFieldsComponents).toHaveLength(2);
            });
        });
    });

    describe('third field column (for total value and price per item)', () => {
        it('renders the dxp text block component to show total price', () => {
            element.orderItem = ItemWithTotalPriceAndOnlyOneQuantity;
            element.currencyCode = 'USD';
            element.showTotal = true;
            return Promise.resolve().then(() => {
                expect(element.querySelector('dxp_base-text-block')).not.toBeNull();
            });
        });

        it('does not render the total price when currency code is undefined', () => {
            //this is because _showTotalPriceInThirdColumn will return false because currencyCode is not defined
            element.orderItem = ItemWithTotalPriceAndQuantity;
            element.showTotal = true;
            return Promise.resolve().then(() => {
                expect(element.querySelector('dxp_base-text-block')).toBeNull();
            });
        });
    });
});
