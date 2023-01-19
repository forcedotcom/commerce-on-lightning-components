import { createElement } from 'lwc';
import ProductTitle from 'commerce_my_account/productTitle';
const NAV_TO_PRODUCT_DETAIL_EVENT = 'navigatetoproductdetailpage';

jest.mock('lightning/navigation', () => ({
    NavigationContext: jest.fn(),
    navigate: jest.fn(),
}));

describe('commerce_my_account-product-title: product title information', () => {
    let element: HTMLElement & ProductTitle;

    beforeEach(() => {
        element = createElement('commerce_my_account-product-title', {
            is: ProductTitle,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'isAvailable',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'name',
            defaultValue: '',
            changeValue: 'Kitten Two',
        },
        {
            property: 'productId',
            defaultValue: undefined,
            changeValue: '01txx0000006i45AAA',
        },
        {
            property: 'productUnavailableMessage',
            defaultValue: '',
            changeValue: null,
        },
        {
            property: 'url',
            defaultValue: undefined,
            changeValue: '/b2c/s/detail/0a9000000000001AAA',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof ProductTitle]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof ProductTitle]).not.toBe(propertyTest.changeValue);

                // Change the value.
                //@ts-ignore
                element[propertyTest.property as keyof ProductTitle] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof ProductTitle]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('is accessible', () => {
        element.name = 'Kitten Two';
        element.productId = '01txx0000006i45AAA';
        return Promise.resolve().then(async () => {
            await expect(element).toBeAccessible();
        });
    });

    it('has a clickable title when product id is non empty and is available', async () => {
        element.name = 'Kitten Two';
        element.productId = '01txx0000006i45AAA';
        element.isAvailable = true;
        await Promise.resolve();
        const productTitleAnchor = element.querySelectorAll('a');
        expect(productTitleAnchor).toHaveLength(1);
    });

    ['', undefined].forEach((productId) => {
        it(`does not have a clickable title when product id is ${productId}.`, async () => {
            element.name = 'Kitten Two';
            element.productId = productId;
            await Promise.resolve();
            const productTitleAnchor = element.querySelector('a');
            expect(productTitleAnchor).toBeNull();
        });
    });

    it(`triggers event ${NAV_TO_PRODUCT_DETAIL_EVENT} on product image click`, () => {
        const handler = jest.fn();
        element.addEventListener(NAV_TO_PRODUCT_DETAIL_EVENT, handler);
        element.productId = '01txx0000006i45AAA';
        element.name = 'Kitten Two';
        element.isAvailable = true;
        element.url = '/b2c/s/detail/0a9000000000001AAA';

        return Promise.resolve().then(() => {
            const productTitle = <HTMLAnchorElement>element.querySelector('a');
            productTitle?.click();
            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: {
                        productId: '01txx0000006i45AAA',
                    },
                })
            );
        });
    });
});
