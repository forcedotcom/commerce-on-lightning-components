import { createElement } from 'lwc';
import OrderTotals from 'commerce_my_account/orderTotals';
import { fieldData } from './data/fieldsData';
// Import mock data.

describe('commerce_my_account/orderTotals: Order Summary OrderTotals', () => {
    let element: HTMLElement & OrderTotals;

    beforeEach(() => {
        jest.clearAllMocks();
        // Create element
        element = createElement('commerce_my_account-order-totals', {
            is: OrderTotals,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        document.body.removeChild(element);
    });

    [
        {
            property: 'titleText',
            defaultValue: undefined,
            changeValue: 'Snazzy Title!',
        },
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
            property: 'showHorizontalLineAboveLastField',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'showLastFieldAsBold',
            defaultValue: false,
            changeValue: true,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof OrderTotals]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof OrderTotals]).not.toBe(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore
                element[propertyTest.property as keyof OrderTotals] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof OrderTotals]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('is accessible', () => {
        element.titleText = 'Totals';
        element.fields = fieldData;

        return Promise.resolve().then(async () => {
            await expect(element).toBeAccessible();
        });
    });

    [false, null, undefined].forEach((showHorizontalLineAboveLastField) => {
        it(`doesn't display a border above last order field if showHorizontalLineAboveLastField is ${showHorizontalLineAboveLastField}`, () => {
            element.titleText = 'Totals';
            element.fields = fieldData;
            element.showHorizontalLineAboveLastField = showHorizontalLineAboveLastField;

            return Promise.resolve().then(() => {
                expect((<HTMLElement>element)?.querySelector('.field-item.slds-border_top:last-child')).toBeNull();
            });
        });
    });

    it('displays a border above last order field if showHorizontalLineAboveLastField is true', async () => {
        element.titleText = 'Totals';
        element.fields = fieldData;
        element.showHorizontalLineAboveLastField = true;
        element.showLastFieldAsBold = true;

        return Promise.resolve().then(() => {
            expect((<HTMLElement>element)?.querySelector('.field-item.slds-border_top:last-child')).toBeTruthy();
        });
    });

    it('displays last order field as bold if showLastFieldAsBold is true', () => {
        element.titleText = 'Totals';
        element.fields = fieldData;
        element.showHorizontalLineAboveLastField = true;
        element.showLastFieldAsBold = true;

        return Promise.resolve().then(() => {
            expect(
                (<HTMLElement>element)?.querySelectorAll('.field-item.slds-text-title_bold:last-child')
            ).toBeTruthy();
        });
    });

    [false, null, undefined].forEach((showLastFieldAsBold) => {
        it(`doesn't display last order field as bold if showLastFieldAsBold is ${showLastFieldAsBold}`, () => {
            element.titleText = 'Totals';
            element.fields = fieldData;
            element.showLastFieldAsBold = showLastFieldAsBold;

            return Promise.resolve().then(() => {
                expect((<HTMLElement>element)?.querySelector('.field-item.slds-text-title_bold:last-child')).toBeNull();
            });
        });
    });
});
