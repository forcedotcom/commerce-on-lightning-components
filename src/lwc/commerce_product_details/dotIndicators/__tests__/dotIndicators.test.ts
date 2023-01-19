import { createElement } from 'lwc';
import DotIndicators from '../dotIndicators';

describe('commerce_product_details/dotIndicators: Dot Indicators', () => {
    let element: HTMLElement & DotIndicators;
    beforeEach(() => {
        element = createElement('commerce_product_details-dot-indicators', {
            is: DotIndicators,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('is accessible', async () => {
        element.count = 4;

        await Promise.resolve();
        await expect(element).toBeAccessible();
    });

    [
        {
            property: 'count',
            defaultValue: 0,
            changeValue: 2,
        },
        {
            property: 'selectedIndex',
            defaultValue: 0,
            changeValue: 1,
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
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

    [null, undefined, 0, -1].forEach((noIndicators) => {
        it(`displays no indicators when the count is set to (${JSON.stringify(noIndicators)})`, async () => {
            // @ts-ignore
            element.count = noIndicators;
            await Promise.resolve();
            // @ts-ignore
            expect(element.querySelector('li')).toBeNull();
        });
    });

    it('displays a number of indicators corresponding to the specified non-zero, positive count', () => {
        element.count = 4;
        return Promise.resolve().then(() => {
            // @ts-ignore
            const entries = Array.from(element.querySelectorAll('li'));
            expect(entries).toHaveLength(4);
        });
    });

    it('shows the indicator at the specified selectedIndex as selected', () => {
        element.count = 5;
        element.selectedIndex = 2;
        return Promise.resolve().then(() => {
            // @ts-ignore
            const dotIndicator = element.querySelector('li:nth-child(3) .slds-is-active');
            expect(dotIndicator).toBeTruthy();
        });
    });

    [null, undefined, -1, 5].forEach((invalidIndex) => {
        it(`shows no indicators as selected when the selectedIndex is set to (${JSON.stringify(invalidIndex)})`, () => {
            element.count = 5;
            // @ts-ignore
            element.selectedIndex = invalidIndex;
            return Promise.resolve().then(() => {
                // @ts-ignore
                expect(element.querySelector('.slds-is-active')).toBeNull();
            });
        });
    });
});
