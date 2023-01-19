import { createElement } from 'lwc';
import Error from 'commerce/error';
describe('error', () => {
    let element: HTMLElement & Error;
    beforeEach(() => {
        element = createElement('commerce-error', {
            is: Error,
        });
        document.body.appendChild(element);
    });
    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'errorLabel',
            defaultValue: undefined,
            changeValue: 'There was an error!',
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof Error]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof Error]).not.toBe(propertyTest.changeValue);
                // Change the value.
                // @ts-ignore
                element[propertyTest.property as keyof Error] = propertyTest.changeValue;
                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof Error]).toBe(propertyTest.changeValue);
            });
        });
    });
});
