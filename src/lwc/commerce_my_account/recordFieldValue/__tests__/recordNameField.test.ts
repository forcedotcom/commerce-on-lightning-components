import { createElement } from 'lwc';
import RecordFieldValue from 'commerce_my_account/recordFieldValue';

jest.mock('lightning/navigation', () => ({
    NavigationContext: jest.fn(),
    navigate: jest.fn(),
}));

jest.mock('lightning/uiRecordApi', () => ({
    getRecord: jest.fn(),
}));

describe('commerce_my_account/RecordFieldValue', () => {
    let element: HTMLElement & RecordFieldValue;

    beforeEach(() => {
        element = createElement('commerce_my_account-record-field-value', {
            is: RecordFieldValue,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'field',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'recordId',
            defaultValue: undefined,
            changeValue: '01txx0000006i45AAA',
        },
        {
            property: 'isLink',
            defaultValue: false,
            changeValue: true,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect.assertions(1);
                expect(element[propertyTest.property as keyof RecordFieldValue]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect.assertions(2);
                expect(element[propertyTest.property as keyof RecordFieldValue]).not.toBe(propertyTest.changeValue);

                // Change the value.
                //@ts-ignore
                element[propertyTest.property as keyof RecordFieldValue] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof RecordFieldValue]).toBe(propertyTest.changeValue);
            });
        });
    });
});
