import { createElement } from 'lwc';

import SliderFacet from '../sliderFacet';

describe('commerce_search/sliderFacet: Slider Facet', () => {
    let element: HTMLElement & SliderFacet;

    beforeEach(() => {
        element = createElement('commerce_search-facet', {
            is: SliderFacet,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'min',
            defaultValue: null,
            changeValue: '5',
        },
        {
            property: 'max',
            defaultValue: null,
            changeValue: '10',
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element.getAttribute(propertyTest.property)).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element.getAttribute(propertyTest.property)).not.toBe(propertyTest.changeValue);

                // Change the value.
                element.setAttribute(propertyTest.property, propertyTest.changeValue);

                // Ensure we reflect the changed value.
                expect(element.getAttribute(propertyTest.property)).toBe(propertyTest.changeValue);
            });
        });
    });
});
