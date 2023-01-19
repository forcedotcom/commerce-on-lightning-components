import { createElement } from 'lwc';

import Facet from 'commerce_search/facet';

const values = [
    {
        id: 'Red',
        name: 'Red (10)',
        checked: false,
        focusOnInit: false,
    },
    {
        id: 'Green',
        name: 'Green (15)',
        checked: false,
        focusOnInit: false,
    },
];

describe('commerce_search/facet: Facet', () => {
    let element;

    beforeEach(() => {
        element = createElement('commerce_search-facet', {
            is: Facet,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'displayData',
            defaultValue: undefined,
            changeValue: {},
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property]).not.toBe(propertyTest.changeValue);

                // Change the value.
                element[propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property]).toStrictEqual(propertyTest.changeValue);
            });
        });
    });

    it('shows the slider facet when facet type is slider', () => {
        element.displayData = {
            type: 'range',
            values,
        };

        return Promise.resolve().then(() => {
            const slider = element.shadowRoot.querySelector('commerce_search-slider-facet');
            expect(slider).toBeTruthy();
        });
    });

    ['radio', 'checkbox', null, undefined].forEach((type) => {
        it(`shows the input facet when the type is set to ${type}`, () => {
            element.displayData = {
                type,
                values,
            };

            return Promise.resolve().then(() => {
                const input = element.shadowRoot.querySelector('commerce_search-input-facet');
                expect(input).toBeTruthy();
            });
        });
    });

    [
        {
            type: 'radio',
            selector: 'commerce_search-input-facet',
        },
        {
            type: 'range',
            selector: 'commerce_search-slider-facet',
        },
    ].forEach((data) => {
        it(`triggers the click event to expand or collapse the facet for type ${data.type}`, () => {
            element.displayData = {
                type: data.type,
                values,
            };

            return Promise.resolve().then(() => {
                const button = element.shadowRoot.querySelector('lightning-button-icon');

                // collapse facet
                button.dispatchEvent(
                    new CustomEvent('click', {
                        bubbles: true,
                        cancelable: true,
                    })
                );

                return Promise.resolve().then(() => {
                    const facet = element.shadowRoot.querySelector(data.selector);
                    expect(facet.className).toContain('slds-hide');
                    expect(button.iconName).toBe('utility:chevronup');
                    expect(button.ariaExpanded).toBe('false');

                    // expand facet
                    button.dispatchEvent(
                        new CustomEvent('click', {
                            bubbles: true,
                            cancelable: true,
                        })
                    );

                    return Promise.resolve().then(() => {
                        expect(facet.className).not.toContain('slds-hide');
                        expect(button.iconName).toBe('utility:chevrondown');
                        expect(button.ariaExpanded).toBe('true');
                    });
                });
            });
        });
    });
});
