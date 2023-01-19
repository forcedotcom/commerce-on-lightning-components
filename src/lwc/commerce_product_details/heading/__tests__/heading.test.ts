import { createElement } from 'lwc';
import Heading from 'commerce_product_details/heading';

describe('commerce_product_details/heading: Product Header', () => {
    let element: HTMLElement & Heading;

    beforeEach(() => {
        element = createElement('commerce_product_details-heading', {
            is: Heading,
        });

        document.body.appendChild(element);
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
            property: 'fields',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'name',
            defaultValue: undefined,
            changeValue: 'A product by any other name would sell as readily',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
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

    describe('product fields', () => {
        const FIELD_SELECTOR = 'commerce-field-display';

        [null, undefined, []].forEach((noFields) => {
            it(`are not displayed if no fields (${JSON.stringify(noFields)}) are present`, () => {
                element.fields = noFields;

                const fields = Array.from(element.querySelectorAll(FIELD_SELECTOR));
                return Promise.resolve().then(() => {
                    expect(fields).toHaveLength(0);
                });
            });
        });

        it('are displayed if fields are present', () => {
            element.fields = [
                {
                    name: 'Product Code',
                    value: 'AGM-84H/K',
                },
                {
                    name: 'Weight',
                    value: '800 lbs',
                },
            ];

            return Promise.resolve().then(() => {
                const fields = Array.from(element.querySelectorAll(FIELD_SELECTOR));
                expect(fields).toHaveLength(2);
            });
        });

        it('is accessible', async () => {
            element.fields = [
                {
                    name: 'Product Code',
                    value: 'AGM-84H/K',
                },
                {
                    name: 'Weight',
                    value: '800 lbs',
                },
            ];

            await Promise.resolve();
            await expect(element).toBeAccessible();
        });
    });
});
