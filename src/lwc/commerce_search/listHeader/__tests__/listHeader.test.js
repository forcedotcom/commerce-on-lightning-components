import { createElement } from 'lwc';

import ProductDetailSummary from 'commerce_search/listHeader';
import * as Constants from '../../listHeader/constants';

describe('commerce_search/listHeader: List Header', () => {
    let element;

    beforeEach(() => {
        element = createElement('commerce_search-list-header', {
            is: ProductDetailSummary,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'displayMode',
            defaultValue: Constants.ResultType.SearchResult,
            changeValue: Constants.ResultType.ProductList,
        },
        {
            property: 'displayCount',
            defaultValue: 0,
            changeValue: 10,
        },
        {
            property: 'displayWord',
            defaultValue: '',
            changeValue: 'Chandelier',
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
                expect(element[propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });

    describe('customStyles', () => {
        [undefined, null, {}].forEach((value) => {
            it(`has no effect on the header list element with a customStyles value of ${value} `, () => {
                element.customStyles = value;
                return Promise.resolve().then(() => {
                    const headerElement = element.shadowRoot.querySelector('h1');
                    expect(headerElement.style.color).toBeFalsy();
                });
            });
        });

        [
            {
                customStyle: { 'class-header-font-size': 'large' },
                className: 'slds-text-heading_large',
            },
            {
                customStyle: { 'class-header-font-size': 'medium' },
                className: 'slds-text-heading_medium',
            },
            {
                customStyle: { 'class-header-font-size': 'small' },
                className: 'slds-text-heading_small',
            },
        ].forEach((styleObj) => {
            it(`has to have the class of ${styleObj.className} with a customStyle ${JSON.stringify(
                styleObj.customStyle
            )}`, () => {
                element.customStyles = styleObj.customStyle;
                return Promise.resolve().then(() => {
                    const headerElement = element.shadowRoot.querySelector(`h1.${styleObj.className}`);
                    expect(headerElement.className.indexOf(styleObj.className)).not.toBe(-1);
                });
            });
        });
    });

    describe('focus', () => {
        it('focuses the header element when the focus api is called', () => {
            // Arrange
            element.displayMode = Constants.ResultType.ProductList;
            element.displayCount = 10;

            // Act
            element.focus();

            // Assert
            const h1El = element.shadowRoot.querySelector('h1');
            expect(element.shadowRoot.activeElement).toBe(h1El);
        });

        it('blurs the header element when the blur api is called', () => {
            // Arrange
            element.displayMode = Constants.ResultType.ProductList;
            element.displayCount = 10;
            element.focus();
            const h1El = element.shadowRoot.querySelector('h1');
            expect(element.shadowRoot.activeElement).toBe(h1El);

            // Act
            element.blur();

            // Assert
            expect(element.shadowRoot.activeElement).not.toBe(h1El);
        });
    });
});
