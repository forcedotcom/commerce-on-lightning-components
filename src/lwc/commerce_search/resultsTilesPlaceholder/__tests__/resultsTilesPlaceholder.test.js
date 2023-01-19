import { createElement } from 'lwc';
import ResultsTilesPlaceholder from 'commerce_search/resultsTilesPlaceholder';

const createComponentUnderTest = () => {
    const element = createElement('commerce_search-results-tiles-placeholder', {
        is: ResultsTilesPlaceholder,
    });
    document.body.appendChild(element);
    return element;
};

describe('commerce_search/resultsTilesPlaceholder: Results Tiles Placeholder', () => {
    let element;

    beforeEach(() => {
        element = createComponentUnderTest();
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('Product Grid Max Columns', () => {
        [
            {
                gridMaxColumnsDisplayed: 4,
                flexBasisValue: '25%',
            },
            {
                gridMaxColumnsDisplayed: 2,
                flexBasisValue: '50%',
            },
            {
                gridMaxColumnsDisplayed: -1,
                flexBasisValue: '25%',
            },
            {
                gridMaxColumnsDisplayed: 0,
                flexBasisValue: '25%',
            },
        ].forEach((input) => {
            it(`has the correct flex basis when gridMaxColumnsDisplayed value is ${input.gridMaxColumnsDisplayed} `, () => {
                element.gridMaxColumnsDisplayed = input.gridMaxColumnsDisplayed;

                return Promise.resolve().then(() => {
                    const productItems = element.shadowRoot.querySelector('.product-grid>li');
                    expect(productItems.style.flexBasis).toBe(input.flexBasisValue);
                });
            });
        });
    });
});
