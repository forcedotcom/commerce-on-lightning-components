import { createElement } from 'lwc';

import InputFacet from '../inputFacet';
import type { DistinctFacetValue } from 'commerce/searchApiInternal';

const values: DistinctFacetValue[] = [
    {
        id: '1',
        name: 'value1 (1)',
        focusOnInit: false,
        checked: false,
        productCount: 1,
    },
    {
        id: '2',
        name: 'value2 (10)',
        focusOnInit: false,
        checked: false,
        productCount: 1,
    },
];

describe('commerce_search/inputFacet: Input Facet', () => {
    let element: HTMLElement & InputFacet;

    beforeEach(() => {
        element = createElement('commerce_search-input-facet', {
            is: InputFacet,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('type property has default as null and could be changed', () => {
        //default type is undefined
        expect(element.type).toBeUndefined();
        // Change the value of type
        element.type = 'radio';
        // Ensure we reflect the changed value.
        expect(element.type).toBe('radio');
    });

    it('values property could be changed', () => {
        // Change the value.
        element.values = values;
        // Ensure we reflect the changed value.
        expect(element.values).toEqual(values);
    });

    it('creates a facet item component for each facet value', () => {
        element.type = 'checkbox';
        element.values = values;

        return Promise.resolve().then(() => {
            const facetValues = element.querySelectorAll('commerce_search-facet-item');
            expect(facetValues).toHaveLength(2);
        });
    });

    it('hides the Show More button when there are less than 10 facet values', () => {
        element.type = 'checkbox';
        element.values = values;

        return Promise.resolve().then(() => {
            const button = element.querySelector('lightning-button');
            expect(button).toBeNull();
        });
    });

    it('triggers the click event to show the remaining facet values', () => {
        // initialize over 10 facet values
        const facetValues = Array.from({ length: 12 }, (v, i) => ({
            id: i.toString(),
            name: i.toString(),
            checked: false,
            focusOnInit: false,
            productCount: 1,
        }));
        element.type = 'checkbox';
        element.values = facetValues;

        return Promise.resolve().then(() => {
            const button = element.querySelector('lightning-button');

            // click to show more facet values
            (<HTMLElement>button).click();

            return Promise.resolve().then(() => {
                const elements = Array.from(element.querySelectorAll('commerce_search-facet-item'));
                expect(elements).toHaveLength(12);
            });
        });
    });

    it('triggers the click event to hide the remaining facet values', () => {
        // initialize over 10 facet values
        const facetValues = Array.from({ length: 12 }, (v, i) => ({
            id: i.toString(),
            name: i.toString(),
            checked: false,
            focusOnInit: false,
            productCount: 1,
        }));
        element.type = 'checkbox';
        element.values = facetValues;

        return Promise.resolve().then(() => {
            const button = element.querySelector('lightning-button');

            // click to show more facet values
            (<HTMLElement>button).click();
            // click again to show less facet values
            (<HTMLElement>button).click();

            return Promise.resolve().then(() => {
                const elements = Array.from(element.querySelectorAll('commerce_search-facet-item'));
                expect(elements).toHaveLength(6);
            });
        });
    });
});
