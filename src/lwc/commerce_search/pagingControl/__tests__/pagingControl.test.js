import { createElement } from 'lwc';
import PagingControl from 'commerce_search/pagingControl';

const createComponentUnderTest = () => {
    const element = createElement('commerce_search-paging-control', {
        is: PagingControl,
    });
    document.body.appendChild(element);
    return element;
};

const PAGE_CHANGE_PREVIOUS_EVT = 'pageprevious';
const PAGE_CHANGE_NEXT_EVT = 'pagenext';
const PAGE_CHANGE_GOTOPAGE_EVT = 'pagegoto';

describe('Paging Control UI', () => {
    let element;

    beforeEach(() => {
        element = createComponentUnderTest();
        element.pageSize = 5;
        element.totalItemCount = 120;
        element.maximumPagesDisplayed = 7;
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'currentPageNumber',
            defaultValue: 1,
            changeValue: 2,
        },
        {
            property: 'pageSize',
            defaultValue: 5,
            changeValue: 4,
        },
        {
            property: 'totalItemCount',
            defaultValue: 120,
            changeValue: 100,
        },
        {
            property: 'maximumPagesDisplayed',
            defaultValue: 7,
            changeValue: 10,
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

    it('displaying results limit hit text on the last page if total results is larger than 5000+pageSize.', () => {
        element.totalItemCount = 5006;
        element.currentPageNumber = 1001;

        return Promise.resolve().then(() => {
            const resultsLimitHitText = element.shadowRoot.querySelectorAll('.limitHitTextSection');
            expect(resultsLimitHitText).toHaveLength(1);
        });
    });

    it('navigates to a given page number', () => {
        element.currentPageNumber = 1;

        return Promise.resolve().then(() => {
            const navButtons = element.shadowRoot.querySelectorAll('.nav-button');
            expect(navButtons).toHaveLength(5);

            let ongotopageFn = jest.fn();

            element.addEventListener(PAGE_CHANGE_GOTOPAGE_EVT, ongotopageFn);

            navButtons[0].dispatchEvent(
                new CustomEvent('click', {
                    bubbles: true,
                    cancelable: true,
                })
            );

            expect(ongotopageFn).toHaveBeenCalledWith(expect.objectContaining({ detail: { pageNumber: 2 } }));
        });
    });

    it('displaying the next and previous page butons', () => {
        const navButtons = element.shadowRoot.querySelectorAll('.nav-direction');
        expect(navButtons).toHaveLength(2);
    });

    it('disables the previous button when first page is the current page', () => {
        element.currentPageNumber = 1;

        return Promise.resolve().then(() => {
            const navButtons = element.shadowRoot.querySelectorAll('.nav-direction');

            expect(navButtons[0].disabled).toBe(true);
        });
    });

    it('enables the previous page button when current page is not first page', () => {
        element.currentPageNumber = 2;

        return Promise.resolve().then(() => {
            const navButtons = element.shadowRoot.querySelectorAll('.nav-direction');

            expect(navButtons[0].disabled).toBe(false);
        });
    });

    it('disables the next page button when the last page is the current page', () => {
        element.currentPageNumber = 24;

        return Promise.resolve().then(() => {
            const navButtons = element.shadowRoot.querySelectorAll('.nav-direction');

            expect(navButtons[1].disabled).toBe(true);
        });
    });

    it('enables the next page button when current page is not last page', () => {
        element.currentPageNumber = 20;

        return Promise.resolve().then(() => {
            const navButtons = element.shadowRoot.querySelectorAll('.nav-direction');

            expect(navButtons[1].disabled).toBe(false);
        });
    });

    it('enables the aria-disabled attribute on the previous page button when first page is current page', () => {
        element.currentPageNumber = 1;

        return Promise.resolve().then(() => {
            const navButtons = element.shadowRoot.querySelectorAll('.nav-direction');

            expect(navButtons[0].getAttribute('aria-disabled')).toBe('true');
        });
    });

    it('disables the aria-disabled attribute on the previous page button when current page is not first page', () => {
        element.currentPageNumber = 2;

        return Promise.resolve().then(() => {
            const navButtons = element.shadowRoot.querySelectorAll('.nav-direction');

            expect(navButtons[0].getAttribute('aria-disabled')).toBe('false');
        });
    });

    it('enables the aria-disabled attribute on the next page button when last page is the current page', () => {
        element.currentPageNumber = 24;

        return Promise.resolve().then(() => {
            const navButtons = element.shadowRoot.querySelectorAll('.nav-direction');

            expect(navButtons[1].getAttribute('aria-disabled')).toBe('true');
        });
    });

    it('disables the aria-disabled attribute on the next page button when current page is not the last page', () => {
        element.currentPageNumber = 20;

        return Promise.resolve().then(() => {
            const navButtons = element.shadowRoot.querySelectorAll('.nav-direction');

            expect(navButtons[1].getAttribute('aria-disabled')).toBe('false');
        });
    });

    it('navigates to previous page', () => {
        element.currentPageNumber = 3;

        return Promise.resolve().then(() => {
            const navButtons = element.shadowRoot.querySelectorAll('.nav-direction');

            const onpreviousFn = jest.fn();

            element.addEventListener(PAGE_CHANGE_PREVIOUS_EVT, onpreviousFn);

            navButtons[0].dispatchEvent(
                new CustomEvent('click', {
                    bubbles: true,
                    cancelable: true,
                })
            );

            expect(onpreviousFn).toHaveBeenCalled();
        });
    });

    it('navigates to next page', () => {
        element.currentPageNumber = 3;

        return Promise.resolve().then(() => {
            const navButtons = element.shadowRoot.querySelectorAll('.nav-direction');

            const onnextFn = jest.fn();

            element.addEventListener(PAGE_CHANGE_NEXT_EVT, onnextFn);

            navButtons[1].dispatchEvent(
                new CustomEvent('click', {
                    bubbles: true,
                    cancelable: true,
                })
            );

            expect(onnextFn).toHaveBeenCalled();
        });
    });
});
