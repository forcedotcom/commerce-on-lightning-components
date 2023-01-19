import { createElement } from 'lwc';
import HorizontalScroller from '../horizontalScroller';

describe('commerce_product_details/horizontalScroller : Horizontal Image Scroller', () => {
    let element: HTMLElement & HorizontalScroller;
    beforeEach(() => {
        element = createElement('commerce_product_details-horizontal-scroller', {
            is: HorizontalScroller,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'showNextTrigger',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'showPreviousTrigger',
            defaultValue: false,
            changeValue: true,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                // @ts-ignore
                expect(element[propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                // @ts-ignore
                expect(element[propertyTest.property]).not.toBe(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore
                element[propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                // @ts-ignore
                expect(element[propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });

    [null, undefined, false].forEach((disabledValue) => {
        it(`does not show the next image trigger when showNextTrigger is set to ${JSON.stringify(
            disabledValue
        )}`, () => {
            // @ts-ignore
            element.showNextTrigger = disabledValue;
            element.showPreviousTrigger = true;

            return Promise.resolve().then(() => {
                // @ts-ignore
                const buttons = Array.from(element.querySelectorAll('lightning-button-icon'));
                expect(buttons).toHaveLength(1); // Only the "previous" trigger
            });
        });
    });

    [null, undefined, false].forEach((disabledValue) => {
        it(`does not show the previous image trigger when showPreviousTrigger is set to ${JSON.stringify(
            disabledValue
        )}`, () => {
            element.showNextTrigger = true;
            // @ts-ignore
            element.showPreviousTrigger = disabledValue;

            return Promise.resolve().then(() => {
                // @ts-ignore
                const buttons = Array.from(element.querySelectorAll('lightning-button-icon'));
                expect(buttons).toHaveLength(1); // Only the "next" trigger
            });
        });
    });

    it('shows the previous image trigger when showPreviousTrigger is set to true', () => {
        element.showNextTrigger = true;
        element.showPreviousTrigger = true;

        return Promise.resolve().then(() => {
            // @ts-ignore
            const buttons = Array.from(element.querySelectorAll('lightning-button-icon'));
            expect(buttons).toHaveLength(2); // Both triggers
        });
    });

    it('fires the "shownext" event when the next image trigger is selected', () => {
        element.showNextTrigger = true;
        element.showPreviousTrigger = false;

        const showNextHandler = jest.fn();
        element.addEventListener('shownext', showNextHandler);

        return Promise.resolve()
            .then(() => {
                // @ts-ignore
                element.querySelector('lightning-button-icon').click();
            })
            .then(() => {
                expect(showNextHandler).toHaveBeenCalledWith(
                    expect.objectContaining({
                        bubbles: false,
                        cancelable: false,
                        composed: false,
                    })
                );
            });
    });

    it('fires the "showprevious" event when the previous image trigger is selected', () => {
        element.showNextTrigger = false;
        element.showPreviousTrigger = true;

        const showPreviousHandler = jest.fn();
        element.addEventListener('showprevious', showPreviousHandler);

        return Promise.resolve()
            .then(() => {
                // @ts-ignore
                element.querySelector('lightning-button-icon').click();
            })
            .then(() => {
                expect(showPreviousHandler).toHaveBeenCalledWith(
                    expect.objectContaining({
                        bubbles: false,
                        cancelable: false,
                        composed: false,
                    })
                );
            });
    });

    it('is accessible', async () => {
        element.showNextTrigger = true;
        element.showPreviousTrigger = true;

        await Promise.resolve();
        await expect(element).toBeAccessible();
    });
});
