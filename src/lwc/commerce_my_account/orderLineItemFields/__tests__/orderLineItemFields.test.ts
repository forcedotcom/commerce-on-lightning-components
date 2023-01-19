import { createElement } from 'lwc';
import OrderLineItemFields from 'commerce_my_account/orderLineItemFields';
import { mockFields } from './data/fields';
import { mockFieldsWithoutFieldsName } from './data/fieldsWithoutFieldsName';
import { querySelector } from 'kagekiri';

const mockGeneratedUrl = '/b2c/s/detail/01oxx0000000001CAA';
jest.mock('lightning/navigation', () => ({
    NavigationContext: jest.fn(),
    navigate: jest.fn(),
    generateUrl: jest.fn(() => mockGeneratedUrl),
}));

jest.mock('lightning/uiRecordApi', () => ({
    getRecord: jest.fn(),
}));

class RecordFieldValue extends Element {
    public isLink = false;
}

describe('commerce_my_account-order-line-item-fields: Order Line Item Fields', () => {
    let element: HTMLElement & OrderLineItemFields;
    type orderLineItemFieldsProperty = 'fields' | 'currencyCode' | 'columns';

    beforeEach(() => {
        element = createElement('commerce_my_account-order-line-item-fields', {
            is: OrderLineItemFields,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'fields',
            defaultValue: undefined,
            changeValue: mockFields,
        },
        {
            property: 'columns',
            defaultValue: undefined,
            changeValue: 4,
        },
        {
            property: 'currencyCode',
            defaultValue: undefined,
            changeValue: 'INR',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<orderLineItemFieldsProperty>propertyTest.property]).toStrictEqual(
                    propertyTest.defaultValue
                );
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<orderLineItemFieldsProperty>propertyTest.property]).not.toStrictEqual(
                    propertyTest.changeValue
                );

                // Change the value.
                // @ts-ignore
                element[<orderLineItemFieldsProperty>propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[<orderLineItemFieldsProperty>propertyTest.property]).toStrictEqual(
                    propertyTest.changeValue
                );
            });
        });
    });

    it('is accessible', async () => {
        element.fields = mockFields;
        await Promise.resolve();
        await expect(element).toBeAccessible();
    });

    it("doesn't displays field's name, if name isn't provided", async () => {
        element.fields = mockFieldsWithoutFieldsName;
        await Promise.resolve();
        const namevalueSeperator = querySelector('span lightning-formatted-rich-text');
        expect(namevalueSeperator).toBeNull();
    });
    it('display order summary id as a link', async () => {
        element.fields = [
            {
                name: 'order number',
                value: '1Osxx0000000001CAA',
                type: 'id',
            },
        ];
        await Promise.resolve();
        const recordFieldValue = <RecordFieldValue>querySelector('commerce_my_account-record-field-value');
        expect(recordFieldValue.isLink).toBe(true);
    });
});
