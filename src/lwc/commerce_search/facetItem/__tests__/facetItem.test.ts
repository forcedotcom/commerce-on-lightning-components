import { createElement } from 'lwc';

import FacetItem from '../facetItem';

const value = {
    id: '1',
    name: 'value1 (1)',
    checked: false,
    focusOnInit: true,
    productCount: 1,
};

const newValue = {
    id: '2',
    name: 'value2 (2)',
    checked: false,
    focusOnInit: true,
    productCount: 2,
};

describe('commerce_search/facetItem: Facet Item', () => {
    let element: HTMLElement & FacetItem;

    beforeEach(() => {
        element = createElement('commerce_search-facet-item', {
            is: FacetItem,
        });
        element.value = value;
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('value property default check and reflects a changed value', () => {
        // Ensure the default value of value is correct
        expect(element.value).toStrictEqual(value);

        // Change the value.
        element.value = newValue;

        // Ensure we reflect the changed value.
        expect(element.value).toStrictEqual(newValue);
    });

    it('type property default check and reflects a changed value', () => {
        // Ensure the default value of type is checkbox, isn't the target value.
        expect(element.type).toBe('checkbox');

        // Change the value.
        element.type = 'radio';

        // Ensure we reflect the changed value.
        expect(element.type).toBe('radio');
    });

    it('triggers the facet value toggle event when clicking', () => {
        return Promise.resolve().then(() => {
            const facetValue = element.querySelector('lightning-input');
            expect((<HTMLInputElement>facetValue).checked).toBeFalsy();

            const facetValueToggleFn = jest.fn();
            element.addEventListener('facetvaluetoggle', facetValueToggleFn);

            // toggle facet value on with click
            (<HTMLElement>facetValue).dispatchEvent(
                new CustomEvent('click', {
                    bubbles: true,
                    cancelable: true,
                })
            );

            expect(facetValueToggleFn).toHaveBeenCalled();
            const facetValue2 = element.querySelector('lightning-input');
            expect((<HTMLInputElement>facetValue2).checked).toBeTruthy();

            // toggle facet value off with click
            (<HTMLElement>facetValue).dispatchEvent(
                new CustomEvent('click', {
                    bubbles: true,
                    cancelable: true,
                })
            );
            expect(facetValueToggleFn).toHaveBeenCalled();
        });
    });

    describe('the disabled checkbox', () => {
        it('should be disabled when product count is 0', () => {
            element.value = {
                id: 'optionId',
                name: 'optionName',
                checked: false,
                focusOnInit: true,
                productCount: 0,
            };

            return Promise.resolve().then(() => {
                const facetValue = element.querySelector('lightning-input');
                // toggle facet value on with click
                (<HTMLElement>facetValue).dispatchEvent(
                    new CustomEvent('click', {
                        bubbles: true,
                        cancelable: true,
                    })
                );
                expect((<HTMLElement>facetValue).getAttribute('disabled')).toBe('true');
            });
        });

        it('should not be disabled when product count is greater than 0', () => {
            element.value = {
                id: 'optionId',
                name: 'optionName',
                checked: true,
                focusOnInit: true,
                productCount: 1,
            };

            return Promise.resolve().then(() => {
                const facetValue = element.querySelector('lightning-input');
                // toggle facet value on with click
                (<HTMLElement>facetValue).dispatchEvent(
                    new CustomEvent('click', {
                        bubbles: true,
                        cancelable: true,
                    })
                );
                expect((<HTMLElement>facetValue).getAttribute('disabled')).toBe('false');
            });
        });
    });

    describe('the keyboard events', () => {
        [
            {
                checked: true,
                resultState: false,
            },
            {
                checked: false,
                resultState: true,
            },
        ].forEach((param) => {
            it(`toggles the checked state from ${param.checked} to ${param.resultState} on pressing "Space"`, () => {
                element.value = {
                    id: 'optionId',
                    name: 'optionName',
                    checked: param.checked,
                    focusOnInit: true,
                    productCount: 1,
                };

                return Promise.resolve().then(() => {
                    const facetValue = element.querySelector('lightning-input');
                    const facetValueToggleFn = jest.fn();

                    element.addEventListener('facetvaluetoggle', facetValueToggleFn);

                    // toggle facet value on with space bar
                    (<HTMLElement>facetValue).dispatchEvent(
                        new KeyboardEvent('keyup', {
                            code: 'Space',
                            bubbles: true,
                            cancelable: true,
                        })
                    );

                    expect(facetValueToggleFn).toHaveBeenCalled();
                });
            });
        });

        [true, false].forEach((state) => {
            ['Enter', 'Backspace', 'ArrowUp', 'ArrowDown'].forEach((code) => {
                it(`won't toggle its ${state ? 'checked' : 'unchecked'} state when pressing ${code}`, () => {
                    element.value = {
                        id: 'optionId',
                        name: 'optionName',
                        checked: state,
                        focusOnInit: true,
                        productCount: 1,
                    };

                    return Promise.resolve().then(() => {
                        const facetValue = element.querySelector('lightning-input');
                        const facetValueToggleFn = jest.fn();
                        element.addEventListener('facetvaluetoggle', facetValueToggleFn);

                        // dispatch the keyup event with the given code
                        (<HTMLElement>facetValue).dispatchEvent(
                            new KeyboardEvent('keyup', {
                                code,
                                bubbles: true,
                                cancelable: true,
                            })
                        );

                        expect(facetValueToggleFn).not.toHaveBeenCalled();

                        return Promise.resolve().then(() => {
                            expect((<HTMLElement>facetValue).getAttribute('data-checked')).toBe(
                                state ? 'true' : 'false'
                            );
                        });
                    });
                });
            });
        });
    });

    it('acquires focus when initally rendering when focusOnInit is true', () => {
        // This is a bit of a cheat to add a handler to the existing DOM element, but it works... :-)
        const facetValue = element.querySelector('lightning-input');
        const focusOnSpy = jest.spyOn(<HTMLElement>facetValue, 'focus');

        // Remove the component from the DOM and re-insert it to (effectively) reset it.
        document.body.removeChild(element);
        element.focusOnInit = true;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            // focus is called once during initial rendering
            expect(focusOnSpy).toHaveBeenCalledTimes(1);
        });
    });

    it('does not acquire focus when focusOnInit is true after the initial render', () => {
        const facetValue = element.querySelector('lightning-input');
        const focusOnSpy = jest.spyOn(<HTMLElement>facetValue, 'focus');

        // Indicate that we want to acquire focus
        element.focusOnInit = true;

        return Promise.resolve().then(() => {
            // focus is called once during initial rendering
            expect(focusOnSpy).not.toHaveBeenCalled();
        });
    });

    it('does not acquire focus when focusOnInit is true after a data change (re-render)', () => {
        // This is a bit of a cheat to add a handler to the existing DOM element, but it works... :-)
        const facetValue = element.querySelector('lightning-input');
        const focusOnSpy = jest.spyOn(<HTMLElement>facetValue, 'focus');

        // Remove the component from the DOM and re-insert it to (effectively) reset it and acquire focus.
        document.body.removeChild(element);
        element.focusOnInit = true;
        document.body.appendChild(element);

        return Promise.resolve()
            .then(() => {
                element.value = newValue;
            })
            .then(() => {
                // Focus was called once during initial rendering
                expect(focusOnSpy).toHaveBeenCalledTimes(1);
            });
    });

    it('does not focus when initally rendering when focusOnInit is false', () => {
        // This is a bit of a cheat to add a handler to the existing DOM element, but it works... :-)
        const facetValue = element.querySelector('lightning-input');
        const focusOnSpy = jest.spyOn(<HTMLElement>facetValue, 'focus');

        // Remove the component from the DOM and re-insert it to (effectively) reset it.
        document.body.removeChild(element);
        element.focusOnInit = false;
        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            // focus is called once during initial rendering
            expect(focusOnSpy).not.toHaveBeenCalled();
        });
    });
});
