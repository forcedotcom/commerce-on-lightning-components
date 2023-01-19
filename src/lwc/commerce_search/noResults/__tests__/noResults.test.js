import { createElement } from 'lwc';
import NoResults from 'commerce_search/noResults';

describe('Property test', () => {
    let elementForPT;
    beforeEach(() => {
        elementForPT = createElement('commerce_search-no-results', {
            is: NoResults,
        });
    });

    const propertyTest = {
        property: 'bodyRichText',
        defaultValue: '',
        changeValue: '<h1>No Results</h1>',
    };

    describe(`the "${propertyTest.property}" property`, () => {
        it(`defaults to ${propertyTest.defaultValue}`, () => {
            expect(elementForPT[propertyTest.property]).toBe(propertyTest.defaultValue);
        });

        it('reflects a changed value', () => {
            // Ensure the value isn't already set to the target value.
            expect(elementForPT[propertyTest.property]).not.toBe(propertyTest.changeValue);

            // Change the value.
            elementForPT[propertyTest.property] = propertyTest.changeValue;

            // Ensure we reflect the changed value.
            expect(elementForPT[propertyTest.property]).toStrictEqual(propertyTest.changeValue);
        });
    });
});
