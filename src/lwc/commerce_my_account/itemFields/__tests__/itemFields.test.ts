import { createElement } from 'lwc';
import ItemFields from 'commerce_my_account/itemFields';
import { mockItemFields, mockItemFieldsWithTotalLineAdj, mockItemFieldsWithNoFieldName } from './data/itemFieldsData';
import { adjustments } from './data/adjustmentsData';
import type FieldDisplay from 'commerce/fieldDisplay';
describe('commerce_my_account-item-fields', () => {
    let element: HTMLElement & ItemFields;
    beforeEach(() => {
        element = createElement('commerce_my_account-item-fields', {
            is: ItemFields,
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
            changeValue: mockItemFields,
        },
        {
            property: 'currencyCode',
            defaultValue: undefined,
            changeValue: 'USD',
        },
        {
            property: 'adjustments',
            defaultValue: undefined,
            changeValue: adjustments,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof ItemFields]).toBe(propertyTest.defaultValue);
            });
            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof ItemFields]).not.toBe(propertyTest.changeValue);
                // Change the value.
                //@ts-ignore
                element[propertyTest.property as keyof ItemFields] = propertyTest.changeValue;
                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof ItemFields]).toStrictEqual(propertyTest.changeValue);
            });
        });
    });

    it('is accessible', () => {
        element.fields = mockItemFieldsWithTotalLineAdj;
        element.adjustments = adjustments;
        element.currencyCode = 'USD';
        return Promise.resolve().then(async () => {
            await expect(element).toBeAccessible();
        });
    });

    [undefined, []].forEach((fields) => {
        it(`doesn't display list of fields if input Field array is ${fields}`, async () => {
            element.fields = fields;
            await Promise.resolve();
            expect(element.querySelectorAll('ul')).toHaveLength(0);
        });
    });

    it('counts the entries of field items', async () => {
        element.fields = mockItemFields;
        element.currencyCode = 'USD';
        await Promise.resolve();
        const itemFieldElements = element.querySelectorAll('li');
        expect(itemFieldElements).toHaveLength(mockItemFields.length);
    });

    it('hides name if name does not exist in field item', async () => {
        element.fields = mockItemFieldsWithNoFieldName;
        element.currencyCode = 'USD';
        await Promise.resolve();
        expect(element.querySelectorAll('li>span>span')).toHaveLength(0);
    });

    it('uses the field value for title attribute', async () => {
        element.fields = mockItemFields;
        element.currencyCode = 'USD';
        await Promise.resolve();
        expect(element.querySelectorAll('[title="1024"]')).toHaveLength(1);
    });

    it('generates a text for title attribute if fieldType is geolocation', async () => {
        element.fields = mockItemFieldsWithNoFieldName;
        element.currencyCode = 'USD';
        await Promise.resolve();
        const fieldDisplayElem: HTMLElement & FieldDisplay = <HTMLElement & FieldDisplay>(
            element.querySelectorAll('commerce-field-display')[2]
        );
        expect(fieldDisplayElem?.title).toBe('23.45 34.67');
    });

    it('displays Info Icon next to TotalLineAdjustmentAmount field when this field is provided', async () => {
        element.fields = mockItemFieldsWithTotalLineAdj;
        element.adjustments = adjustments;
        element.currencyCode = 'USD';
        await Promise.resolve();
        expect(element.querySelectorAll('commerce_unified_promotions-applied-details-popover')).toHaveLength(1);
    });
    it(`doesn't display Info Icon when TotalLineAdjustmentAmount field is not provided`, async () => {
        element.fields = mockItemFields;
        await Promise.resolve();
        expect(element.querySelectorAll('commerce_unified_promotions-applied-details-popover')).toHaveLength(0);
    });
});
