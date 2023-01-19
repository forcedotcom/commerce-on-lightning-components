import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
import WiredProductDescription from '../wiredProductDescription';
import { ProductAdapter } from 'commerce/productApi';
import * as product from './data/getProduct.json';

jest.mock('commerce/productApi', () => ({
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ProductAdapter: require('@salesforce/wire-service-jest-util').createTestWireAdapter(),
}));

describe('commerce_product_details/wiredProductDescription', () => {
    let element: HTMLElement & WiredProductDescription;
    beforeEach(() => {
        element = createElement('commerce_product_details-product-description-wrapper', {
            is: WiredProductDescription,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'isExpanded',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'label',
            defaultValue: undefined,
            changeValue: 'The Deets',
        },
        {
            property: 'productId',
            defaultValue: undefined,
            changeValue: 'ABC-123',
        },
        {
            property: 'sectionContentField',
            defaultValue: undefined,
            changeValue: 'DynamoField',
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                // @ts-ignore
                expect(element[propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                // @ts-ignore
                expect(element[propertyTest.property]).not.toBe(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore
                element[propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                // @ts-ignore
                expect(element[propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('displays the configured field data when a field name is specified and product data is available', () => {
        element.label = 'Mock Label';
        element.isExpanded = true;
        element.sectionContentField = 'Description';

        return Promise.resolve()
            .then(() => {
                (<typeof ProductAdapter & typeof TestWireAdapter>ProductAdapter).emit({ data: product });
            })
            .then(() => {
                const displayComponent = <HTMLElement & { content: string }>(
                    element.querySelector('b2b_buyer_product_details-expandable-text-section')
                );
                expect(displayComponent?.content).toBe(product.fields.Description);
            });
    });

    it('displays no data when a field name is specified and no product data is available', () => {
        element.label = 'Mock Label';
        element.isExpanded = true;
        element.sectionContentField = 'Description';

        return Promise.resolve().then(() => {
            // @ts-ignore
            const displayComponent = element.querySelector('b2b_buyer_product_details-expandable-text-section');
            expect(displayComponent).toBeNull();
        });
    });

    it('displays no data when a field name is specified and no product data is available due to an error', () => {
        (<typeof ProductAdapter & typeof TestWireAdapter>ProductAdapter).emit({ error: 'Whoops...' });
        element.label = 'Mock Label';
        element.isExpanded = true;
        element.sectionContentField = 'Description';

        return Promise.resolve().then(() => {
            // @ts-ignore
            const displayComponent = element.querySelector('b2b_buyer_product_details-expandable-text-section');
            expect(displayComponent).toBeNull();
        });
    });

    [undefined, ''].forEach((emptyContentField) => {
        it(`displays no data when a field name is not specified (${JSON.stringify(
            emptyContentField
        )}) and product data is available`, () => {
            (<typeof ProductAdapter & typeof TestWireAdapter>ProductAdapter).emit({ data: product });
            element.label = 'Mock Label';
            element.isExpanded = true;
            element.sectionContentField = emptyContentField;

            return Promise.resolve().then(() => {
                // @ts-ignore
                const displayComponent = element.querySelector('b2b_buyer_product_details-expandable-text-section');
                expect(displayComponent).toBeNull();
            });
        });
    });
});
